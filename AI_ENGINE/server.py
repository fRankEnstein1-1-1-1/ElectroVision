import os
import warnings
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from meteostat import Point, Hourly
from dotenv import load_dotenv

# --- 0. BOOT & MODEL LOAD ---
load_dotenv()

MODEL_PATH      = "Model_LongTerm.pkl"
MODEL_JSON_PATH = "Model_LongTerm_v2.json"   # XGBoost native format (no pickle warnings)
MUMBAI          = Point(19.0760, 72.8777)
MODEL_AVAILABLE = False
model           = None

# Prefer the already-converted native JSON if it exists
if os.path.exists(MODEL_JSON_PATH):
    try:
        import xgboost as xgb
        model = xgb.XGBRegressor()
        model.load_model(MODEL_JSON_PATH)
        MODEL_AVAILABLE = True
        print(f"✅ Oversight Model Loaded from {MODEL_JSON_PATH} (clean, no warnings)")
    except Exception as e:
        print(f"⚠️  JSON model load failed ({e}), falling back to pkl...")

# Fall back to pkl, suppress the version warning, then re-save as JSON
if not MODEL_AVAILABLE and os.path.exists(MODEL_PATH):
    try:
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=UserWarning)
            model = joblib.load(MODEL_PATH)
        MODEL_AVAILABLE = True
        # One-time migration to native XGBoost format
        try:
            model.get_booster().save_model(MODEL_JSON_PATH)
            print(f"✅ Oversight Model Loaded & migrated → {MODEL_JSON_PATH} (future starts will be clean)")
        except Exception:
            print("✅ Oversight Model Loaded (pkl)")
    except Exception as e:
        print(f"⚠️  Model load failed ({e}). /predict will use physics-based fallback.")

if not MODEL_AVAILABLE:
    print("⚠️  No model file found. /predict uses physics-based fallback.")

app = FastAPI(title="Grid Oversight Command API", version="2.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. CONSTANTS ---

SENSITIVITY = {
    "temp":        2.1,
    "humidity":    1.5,
    "solar":      -0.005,
    "growth_rate": 0.08,
}

DIURNAL = {
    "00:00": 0.82, "04:00": 0.75, "08:00": 1.02,
    "12:00": 1.23, "16:00": 1.16, "20:00": 1.09, "23:59": 0.95,
}

CITY_BASE_LOADS = {
    "Mumbai":     5200, "Pune":       3800, "Nagpur":     2900,
    "Nashik":     2100, "Aurangabad": 1800, "Kolhapur":   1600,
}

BASELINE = {"temp": 28.0, "humidity": 68.0, "solar": 500.0}

# --- 2. PYDANTIC SCHEMAS ---

class SimulationParams(BaseModel):
    temp:     float = Field(30.0, ge=-10,  le=60)
    humidity: float = Field(50.0, ge=0,    le=100)
    solar:    float = Field(500,  ge=0,    le=1200)

class ForecastRequest(BaseModel):
    range:  str                        = Field("next-day")
    offset: int                        = Field(0, ge=0, le=20)
    params: Optional[SimulationParams] = None

class PolicyRequest(BaseModel):
    target_year: int
    iex_factor:  float
    city_data:   dict

# Mumbai monthly climate normals for next-year model inference
# (month, temp °C, humidity %, solar W/m²) — IMD/NOAA averages
MUMBAI_MONTHLY_CLIMATE = [
    ("Jan", 24.5, 64, 540), ("Feb", 25.8, 61, 590), ("Mar", 28.3, 65, 620),
    ("Apr", 30.6, 70, 580), ("May", 32.1, 73, 520), ("Jun", 30.2, 85, 310),
    ("Jul", 28.9, 90, 270), ("Aug", 28.7, 89, 290), ("Sep", 29.1, 86, 370),
    ("Oct", 30.2, 78, 460), ("Nov", 28.6, 68, 510), ("Dec", 26.1, 63, 520),
]

# --- 3. HELPERS ---

def weather_impact(temp: float, humidity: float, solar: float) -> float:
    d_temp  = (temp     - BASELINE["temp"])     * SENSITIVITY["temp"]
    d_humid = (humidity - BASELINE["humidity"]) / 10 * SENSITIVITY["humidity"]
    d_solar = (solar    - BASELINE["solar"])    * SENSITIVITY["solar"]
    return round(d_temp + d_humid + d_solar, 3)

def add_noise(value: float, scale: float) -> float:
    return round(value + float(np.random.uniform(-scale, scale)), 1)

def build_forecast(range_key: str, offset: int, params: Optional[SimulationParams]) -> list:
    growth  = 1 + offset * SENSITIVITY["growth_rate"]
    overlay = weather_impact(params.temp, params.humidity, params.solar) if params else 0.0
    data    = []

    if range_key == "next-hour":
        base = 142 * growth
        for i in range(0, 70, 10):
            shape  = 1 + 0.015 * np.sin(np.pi * i / 60)
            actual = add_noise(base * shape, 0.8)
            pred   = round(base * shape + 1.5 + overlay, 1)
            data.append({"time": f"{i}m", "actual": actual, "predicted": pred})

    elif range_key == "next-day":
        base = 130 * growth
        for time_label, multiplier in DIURNAL.items():
            actual = add_noise(base * multiplier, 3)
            pred   = round(base * multiplier + 4 + overlay, 1)
            data.append({"time": time_label, "actual": actual, "predicted": pred})

    elif range_key == "next-week":
        days = [
            ("Mon", 1.05), ("Tue", 1.08), ("Wed", 1.10),
            ("Thu", 1.12), ("Fri", 1.15), ("Sat", 0.95), ("Sun", 0.87),
        ]
        base_mw = sum(CITY_BASE_LOADS.values()) * growth

        for day, dow_mult in days:
            features = pd.DataFrame([{
                "temp":       BASELINE["temp"]     + add_noise(0, 1.5),
                "humidity":   BASELINE["humidity"] + add_noise(0, 3),
                "solar":      BASELINE["solar"]    + add_noise(0, 30),
                "year":       datetime.now().year,
                "iex_factor": 1.0,
                "base_load":  base_mw * dow_mult,
            }])

            if MODEL_AVAILABLE and model is not None:
                try:
                    pred = round(float(model.predict(features)[0]) * dow_mult + overlay, 1)
                except Exception as e:
                    print(f"⚠️  {day}: {e}")
                    pred = round(base_mw * dow_mult + overlay, 1)
            else:
                pred = round(base_mw * dow_mult + overlay, 1)

            actual = add_noise(pred, 8)
            data.append({"time": day, "actual": actual, "predicted": pred})

    elif range_key == "next-month":
        DOW_PROFILE  = [1.05, 1.08, 1.10, 1.12, 1.15, 0.95, 0.87]
        DOW_NAMES    = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        base_mw      = sum(CITY_BASE_LOADS.values()) * growth
        current_year = datetime.now().year

        for week_num in range(1, 5):
            week_daily_preds = []

            for day_idx, dow_mult in enumerate(DOW_PROFILE):
                features = pd.DataFrame([{
                    "temp":       BASELINE["temp"]     + add_noise(0, 1.5),
                    "humidity":   BASELINE["humidity"] + add_noise(0, 3),
                    "solar":      BASELINE["solar"]    + add_noise(0, 30),
                    "year":       current_year,
                    "iex_factor": 1.0,
                    "base_load":  base_mw * dow_mult,
                }])

                if MODEL_AVAILABLE and model is not None:
                    try:
                        day_pred = float(model.predict(features)[0]) * dow_mult
                    except Exception as e:
                        print(f"⚠️  Wk {week_num} {DOW_NAMES[day_idx]}: {e}")
                        day_pred = base_mw * dow_mult + overlay
                else:
                    day_pred = base_mw * dow_mult + overlay

                week_daily_preds.append(round(day_pred, 1))

            # Average the 7 daily predictions → weekly MW
            week_avg = round(sum(week_daily_preds) / 7, 1)
            data.append({"time": f"Wk {week_num}", "predicted": week_avg})



    return data

# --- 4. ENDPOINTS ---

@app.get("/api/initial-state")
async def get_initial_state():
    try:
        now  = datetime.now()
        rows = Hourly(MUMBAI, now - timedelta(hours=2), now).fetch()
        if rows.empty:
            raise ValueError("Empty response from Meteostat")
        latest  = rows.iloc[-1]
        weather = {
            "temp":     round(float(latest["temp"]), 1),
            "humidity": round(float(latest["rhum"]), 1),
            "solar":    500,
        }
    except Exception as e:
        print(f"⚠️  Weather fetch failed: {e}")
        weather = {"temp": 30.0, "humidity": 55.0, "solar": 500}

    return {
        "weather":       weather,
        "weights":       SENSITIVITY,
        "system_status": "SECURE",
        "model_online":  MODEL_AVAILABLE,
    }



@app.get("/api/forecast/yearly")
async def get_next_year_forecast():
    """
    Runs real XGBoost model inference for each of the next 12 months
    using Mumbai climate normals. Returns monthly predicted net drawl in MUs.
    Falls back to physics model if ML model unavailable.
    """
    next_year = datetime.now().year + 1
    results   = []

    for month, temp, humidity, solar in MUMBAI_MONTHLY_CLIMATE:
        # --- Build feature row the same way the model was trained ---
        base_load = sum(CITY_BASE_LOADS.values())   # total Maharashtra base MW
        features  = pd.DataFrame([{
            "temp":       temp,
            "humidity":   humidity,
            "solar":      solar,
            "year":       next_year,
            "iex_factor": 1.0,
            "base_load":  base_load,
        }])

        if MODEL_AVAILABLE and model is not None:
            try:
                raw_pred = float(model.predict(features)[0])
                # Model returns MW per hour → scale to monthly MUs
                # MU = MW × hours_in_month / 1000
                days_in_month = 30   # approximate; good enough for forecast
                predicted_mu  = round(raw_pred * 24 * days_in_month / 1000, 1)
            except Exception as e:
                print(f"⚠️  Model inference failed for {month}: {e}")
                predicted_mu = _physics_monthly_mu(temp, humidity, solar, next_year)
        else:
            predicted_mu = _physics_monthly_mu(temp, humidity, solar, next_year)

        results.append({"time": month, "predicted": predicted_mu})

    return results


def _physics_monthly_mu(temp: float, humidity: float, solar: float, year: int) -> float:
    """Physics fallback: baseline MU scaled by weather impact and year growth."""
    growth   = 1 + (year - 2025) * SENSITIVITY["growth_rate"]
    w_delta  = weather_impact(temp, humidity, solar)
    base_mw  = sum(CITY_BASE_LOADS.values()) * growth
    monthly_mu = round((base_mw + w_delta * 100) * 24 * 30 / 1000, 1)
    return monthly_mu

@app.get("/api/forecast/current-year")
async def get_current_year_forecast():
    """Same as yearly but for the current year."""
    current_year = datetime.now().year
    results = []

    for month, temp, humidity, solar in MUMBAI_MONTHLY_CLIMATE:
        base_load = sum(CITY_BASE_LOADS.values())
        features  = pd.DataFrame([{
            "temp": temp, "humidity": humidity, "solar": solar,
            "year": current_year, "iex_factor": 1.0, "base_load": base_load,
        }])

        if MODEL_AVAILABLE and model is not None:
            try:
                raw_pred     = float(model.predict(features)[0])
                predicted_mu = round(raw_pred * 24 * 30 / 1000, 1)
            except Exception as e:
                print(f"⚠️  {month}: {e}")
                predicted_mu = _physics_monthly_mu(temp, humidity, solar, current_year)
        else:
            predicted_mu = _physics_monthly_mu(temp, humidity, solar, current_year)

        results.append({"time": month, "predicted": predicted_mu})

    return results


@app.get("/api/forecast")
async def get_forecast_get(range: str = "next-day", offset: int = 0):
    return build_forecast(range, offset, params=None)


@app.post("/api/forecast")
async def get_forecast_post(body: ForecastRequest):
    return build_forecast(body.range, body.offset, body.params)



@app.post("/predict")
async def predict_policy_dashboard(body: PolicyRequest):
    year_factor = 1 + (body.target_year - 2025) * SENSITIVITY["growth_rate"]
    breakdown   = {}
    total_mw    = 0.0

    for city, sensors in body.city_data.items():
        base      = CITY_BASE_LOADS.get(city, 2000)
        w_impact  = weather_impact(
            sensors.get("temp", 28),
            sensors.get("humidity", 68),
            sensors.get("solar", 500),
        )
        city_load = (base + w_impact * 100) * year_factor * body.iex_factor
        city_load = round(city_load, 1)

        if MODEL_AVAILABLE and model is not None:
            try:
                features  = pd.DataFrame([{
                    "temp":       sensors.get("temp", 28),
                    "humidity":   sensors.get("humidity", 68),
                    "solar":      sensors.get("solar", 500),
                    "year":       body.target_year,
                    "iex_factor": body.iex_factor,
                    "base_load":  base,
                }])
                ml_pred   = float(model.predict(features)[0])
                city_load = round(ml_pred * body.iex_factor, 1)
            except Exception as e:
                print(f"⚠️  Model inference failed for {city}: {e}")

        breakdown[city] = city_load
        total_mw       += city_load

    return {
        "success":   True,
        "total_mw":  round(total_mw, 1),
        "breakdown": breakdown,
        "year":      body.target_year,
    }


# --- 5. PUBLIC DASHBOARD ENDPOINT ---

@app.get("/api/public/status")
async def get_public_status():
    """
    Citizen-facing endpoint. Returns current grid load, stability,
    peak alert status, and energy saving tip — all derived from
    the model + live weather. No sensitive data exposed.
    """
    try:
        now  = datetime.now()
        rows = Hourly(MUMBAI, now - timedelta(hours=2), now).fetch()
        if rows.empty:
            raise ValueError("empty")
        latest = rows.iloc[-1]
        temp     = round(float(latest["temp"]), 1)
        humidity = round(float(latest["rhum"]), 1)
    except Exception:
        temp, humidity = 30.0, 65.0

    solar    = 500.0
    base_mw  = sum(CITY_BASE_LOADS.values())
    hour     = datetime.now().hour

    # Diurnal multiplier for current hour
    if   hour < 4:  d_mult = 0.78
    elif hour < 8:  d_mult = 0.80
    elif hour < 12: d_mult = 1.05
    elif hour < 16: d_mult = 1.22
    elif hour < 20: d_mult = 1.18
    elif hour < 22: d_mult = 1.08
    else:           d_mult = 0.92

    # Model inference for current load
    features = pd.DataFrame([{
        "temp":       temp,
        "humidity":   humidity,
        "solar":      solar,
        "year":       datetime.now().year,
        "iex_factor": 1.0,
        "base_load":  base_mw * d_mult,
    }])

    if MODEL_AVAILABLE and model is not None:
        try:
            current_mw = round(float(model.predict(features)[0]) * d_mult, 1)
        except Exception:
            current_mw = round(base_mw * d_mult + weather_impact(temp, humidity, solar) * 100, 1)
    else:
        current_mw = round(base_mw * d_mult + weather_impact(temp, humidity, solar) * 100, 1)

    capacity_mw  = base_mw * 1.25          # assume 25% headroom above base
    load_pct     = round((current_mw / capacity_mw) * 100, 1)
    is_peak      = load_pct > 80
    is_critical  = load_pct > 92

    # Renewable estimate (solar + wind proxy: higher solar → more renewables)
    renewable_pct = round(min(45, 20 + (solar / 1000) * 30 - (temp - 25) * 0.3), 1)

    # Dynamic saving tip based on conditions
    if is_critical:
        tip = "🚨 Critical load — please avoid all non-essential appliances immediately."
    elif is_peak and temp > 32:
        tip = "☀️ Peak hours + high heat. Set AC to 24°C and avoid using ovens or dryers."
    elif is_peak:
        tip = "⚡ Peak demand right now. Delay washing machines and dishwashers if possible."
    elif hour >= 22 or hour < 6:
        tip = "🌙 Off-peak hours — great time to run heavy appliances and charge EVs."
    else:
        tip = "✅ Grid is stable. Consider switching to energy-saving mode on your devices."

    return {
        "current_mw":     current_mw,
        "capacity_mw":    round(capacity_mw, 1),
        "load_pct":       load_pct,
        "is_peak":        is_peak,
        "is_critical":    is_critical,
        "renewable_pct":  renewable_pct,
        "weather":        {"temp": temp, "humidity": humidity},
        "tip":            tip,
        "co2_saved_tons": round(renewable_pct * current_mw * 0.0005, 1),
        "timestamp":      datetime.now().strftime("%H:%M"),
    }


# --- 6. ENTRY POINT ---
# NOTE: Do NOT pass reload=True when running as `python main.py`.
# reload only works with the import-string form:
#   uvicorn main:app --reload
# Running directly is fine for production / simple dev starts.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)