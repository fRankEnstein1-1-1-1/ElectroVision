# ⚡ ElectroVision

> City-scale electricity demand forecasting with role-based dashboards for government planners, policy makers, and end users.

---

## What is this?

ElectroVision is an end-to-end electricity demand forecasting system built for the Western Regional grid in India. It predicts short and long-term electricity demand using historical grid load data combined with weather and demographic signals — and surfaces those predictions through three distinct dashboards tailored to different users.

The core problem: grid operators and planners need accurate demand forecasts to prevent blackouts, price electricity on exchanges like IEX, and plan infrastructure. Most existing tools are opaque black boxes. ElectroVision makes forecasting explainable and interactive.

---

## The Data

- **Sources:** WRLDC (Western Regional Load Despatch Centre) and IEX (Indian Energy Exchange)
- **Granularity:** Every 15 minutes over 4 years
- **Volume:** 140,000+ data points
- **Enrichment features:** Temperature, humidity (weather APIs), population data (Google public datasets)
- **Target variable:** Grid load in MW drawn from the central regional grid

---

## Model Benchmarking

We benchmarked three model families before selecting the final architecture:

| Model | Accuracy (2024) | RMSE (2024 MW) | MAE (2024 MW) | Training Time |
|---|---|---|---|---|
| XGBoost | **90.1%** | **240 MW** | **192 MW** | **~5s** |
| Random Forest | 89.8% | 244 MW | 197 MW | ~11s |
| LSTM | 88.8% | 260 MW | 210 MW | **532s** |

**Why XGBoost?** Best accuracy-to-training-time ratio by a large margin. LSTM took 532 seconds to train for marginally worse accuracy — not justified for a system that needs to be retrained on fresh grid data regularly. Random Forest was close but slower and slightly less accurate.

**Final model performance on 2026 holdout data:**
- Accuracy: 92.2%
- RMSE: 158 MW
- MAE: 129 MW

---

## System Architecture

```
Data Pipeline
├── WRLDC scraper       (15-min grid load readings)
├── IEX scraper         (energy trade prices)
├── Weather API         (temperature, humidity)
└── Population data     (Google public datasets)
        │
        ▼
Feature Engineering & Cleaning
        │
        ▼
Model Layer (XGBoost)
        │
        ▼
┌───────────────────────────────────┐
│         Role-Based Dashboards     │
├─────────────┬──────────┬──────────┤
│ Government  │  Policy  │  Users   │
│             │  Makers  │          │
└─────────────┴──────────┴──────────┘
```

---

## The Three Dashboards

### 🏛️ Government Dashboard
For grid operators and energy ministry planners.
- Demand forecast graphs: next day / week / month / year
- Live IEX trade price overlay (derived from the same forecasting model)
- Historical vs predicted comparison view

### 📊 Policy Makers Dashboard
For analysts and planners who need to model scenarios.
- Interactive what-if simulator: adjust parameters (industrial load, seasonal factors, population growth) and see how demand responds
- Side-by-side comparison of base vs adjusted forecast
- Useful for planning infrastructure investment and energy policy

### 👤 End User Dashboard
For general public / consumers.
- Simple live indicator: current load on the regional grid
- "High / Medium / Low" load status — tells users whether it's a good time to run heavy appliances or if the grid is under stress
- Designed to reduce voluntary peak-hour consumption and prevent blackouts

---

## Tech Stack

| Layer | Tools |
|---|---|
| Language | Python |
| ML Models | XGBoost, Random Forest, LSTM (Scikit-Learn, TensorFlow) |
| Data Processing | Pandas, NumPy |
| Scraping | BeautifulSoup, Requests |
| Visualisation | Matplotlib, Plotly |

---

## Setup

```bash
# Clone the repo
git clone https://github.com/fRankEnstein1-1-1-1/ElectroVision.git
cd ElectroVision

# Install dependencies
pip install -r requirements.txt

# Run data pipeline (fetches and cleans data)
python pipeline/fetch_data.py

# Train the model
python model/train.py

# Launch dashboards
python app/government.py   # Government dashboard
python app/policy.py       # Policy maker dashboard
python app/user.py         # End user dashboard
```

---

## Results Summary

The model successfully captures both long-term seasonal demand trends (summer cooling loads, winter heating) and short-term spikes (industrial peak hours, festivals). The 15-minute granularity from WRLDC data was critical — hourly data missed intra-hour demand spikes that could cause localised grid stress.

XGBoost's speed advantage (7s vs 532s for LSTM) matters in production: the model can be retrained nightly on fresh WRLDC data without disrupting the live dashboards.

---

## Team

Built by Jishnu Nair as part of the BE (Artificial Intelligence) curriculum at Don Bosco Institute of Technology, Mumbai.

---

## License

MIT
