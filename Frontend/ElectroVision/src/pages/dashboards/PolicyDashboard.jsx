import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend, CartesianGrid, Cell,
} from "recharts";
import { ArrowLeft, Save, Zap, Globe, TrendingUp, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./PolicyDashboard.css";

const CITIES = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur"];

const CITY_COLORS = {
  Mumbai:    "#3b82f6",
  Pune:      "#8b5cf6",
  Nagpur:    "#ec4899",
  Nashik:    "#10b981",
  Aurangabad:"#f59e0b",
  Kolhapur:  "#06b6d4",
};

const SENSOR_CONFIG = {
  temp:     { label: "TEMPERATURE", unit: "°C", min: 10, max: 55 },
  humidity: { label: "HUMIDITY",    unit: "%",  min: 0,  max: 100 },
  solar:    { label: "SOLAR IRRAD", unit: "W",  min: 0,  max: 1000 },
};

// Compute percentage for CSS --val on the slider fill
const sliderPct = (val, min, max) => `${((val - min) / (max - min)) * 100}%`;

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="label">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.fill || p.stroke || "#fff", fontSize: "0.8rem", fontFamily: "Space Mono, monospace" }}>
          {p.dataKey}: <b>{p.value?.toLocaleString()} MW</b>
        </div>
      ))}
    </div>
  );
};

const PolicyDashboard = () => {
  const navigate = useNavigate();
  const [activeCity, setActiveCity] = useState("Mumbai");
  const [result, setResult]   = useState(null);
  const [baseline, setBaseline] = useState(null);

  const [params, setParams] = useState({ target_year: 2026, iex_factor: 1.0 });

  const [cityData, setCityData] = useState({
    Mumbai:     { temp: 32, humidity: 75, solar: 450 },
    Pune:       { temp: 30, humidity: 40, solar: 500 },
    Nagpur:     { temp: 38, humidity: 30, solar: 600 },
    Nashik:     { temp: 28, humidity: 45, solar: 480 },
    Aurangabad: { temp: 34, humidity: 35, solar: 550 },
    Kolhapur:   { temp: 29, humidity: 60, solar: 420 },
  });

  // Debounced backend call — unchanged
  useEffect(() => {
    const update = async () => {
      try {
        const res = await fetch("http://localhost:5000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...params, city_data: cityData }),
        });
        const json = await res.json();
        if (json.success) setResult(json.data);
      } catch (e) {
        console.error(e);
      }
    };
    const t = setTimeout(update, 300);
    return () => clearTimeout(t);
  }, [cityData, params]);

  const chartData = CITIES.map((c) => ({
    name:     c,
    Current:  result?.breakdown?.[c]   || 0,
    Baseline: baseline?.breakdown?.[c] || 0,
  }));

  const isOverload = result?.total_mw > 32000;

  const updateSensor = (field, value) =>
    setCityData((prev) => ({
      ...prev,
      [activeCity]: { ...prev[activeCity], [field]: parseFloat(value) },
    }));

  return (
    <div className="policy-layout">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="glass-panel main-nav">
        <div className="nav-brand">
          <button onClick={() => navigate("/")} className="back-arrow" aria-label="Back">
            <ArrowLeft />
          </button>
          <h1>STRATEGIC GRID COMMAND</h1>
        </div>

        <div className="global-controls">
          {/* Year slider in header */}
          <div className="nav-stat year-slider-container">
            <label>
              <TrendingUp size={13} />
              YEAR:&nbsp;<b>{params.target_year}</b>
            </label>
            <input
              type="range"
              min="2025"
              max="2035"
              value={params.target_year}
              style={{ "--val": sliderPct(params.target_year, 2025, 2035) }}
              onChange={(e) =>
                setParams({ ...params, target_year: parseInt(e.target.value) })
              }
            />
          </div>

          <button className="snapshot-btn" onClick={() => setBaseline(result)}>
            <Save size={16} /> SNAPSHOT BASELINE
          </button>
        </div>
      </header>

      {/* ── MAIN GRID ─────────────────────────────────────── */}
      <main className="dashboard-grid">

        {/* LEFT SIDEBAR */}
        <section className="sidebar">

          {/* Market Index */}
          <div className="glass-panel control-card padded">
            <h3><Globe size={14} /> Market Index</h3>
            <div className="control-group">
              <div className="label-row">
                <span>IEX Trade Factor</span>
                <b>{params.iex_factor.toFixed(1)}x</b>
              </div>
              <div className="slider-wrap">
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={params.iex_factor}
                  style={{ "--val": sliderPct(params.iex_factor, 0.5, 2.0) }}
                  onChange={(e) =>
                    setParams({ ...params, iex_factor: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* City Picker */}
          <div className="glass-panel city-selector-container">
            <h3><MapPin size={14} /> Select City</h3>
            <div className="city-selector">
              {CITIES.map((c) => (
                <button
                  key={c}
                  className={`city-pill ${activeCity === c ? "active" : ""}`}
                  onClick={() => setActiveCity(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* City Sensors */}
          <div className="glass-panel control-card padded" style={{ flex: 1 }}>
            <h3>
              <MapPin size={14} />
              {activeCity.toUpperCase()} SENSORS
            </h3>

            <div className="sensor-grid">
              {Object.entries(SENSOR_CONFIG).map(([field, cfg]) => {
                const val = cityData[activeCity][field];
                const pct = sliderPct(val, cfg.min, cfg.max);
                return (
                  <div key={field} className="control-group">
                    <div className="label-row">
                      <span>{cfg.label}</span>
                      <b>
                        {val}
                        <span style={{ color: "var(--slate-500)", fontWeight: 400 }}>
                          &nbsp;{cfg.unit}
                        </span>
                      </b>
                    </div>
                    <div className="slider-wrap">
                      <input
                        type="range"
                        min={cfg.min}
                        max={cfg.max}
                        value={val}
                        style={{ "--val": pct }}
                        onChange={(e) => updateSensor(field, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT VIZ AREA */}
        <section className="viz-center-vertical">

          {/* Stats Row */}
          <div className="stats-row">
            <div className="glass-panel stat-card main-stat">
              <span className="label">Total Estimated Load</span>
              <div className="value">
                {result?.total_mw
                  ? result.total_mw.toLocaleString()
                  : <span style={{ color: "var(--slate-600)" }}>—</span>}
                <small>MW</small>
              </div>
            </div>

            <div className={`glass-panel stat-card status ${isOverload ? "crit" : ""}`}>
              <div className="status-dot" />
              <div>
                <div className="value-text">
                  {isOverload ? "OVERLOAD RISK" : "GRID STABLE"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--slate-500)", fontFamily: "Space Mono", marginTop: 4 }}>
                  {isOverload ? "CRITICAL" : "NOMINAL"}
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-panel chart-box-huge">
            <p className="chart-header">City Load Distribution — MW</p>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontFamily: "Space Mono", fontSize: 11 }}
                />
                <YAxis
                  stroke="#475569"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontFamily: "Space Mono", fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={<CustomTooltip />}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: 16,
                    fontFamily: "Space Mono",
                    fontSize: 11,
                    color: "#64748b",
                  }}
                />

                {/* Current bars — coloured per city */}
                <Bar dataKey="Current" radius={[6, 6, 0, 0]} barSize={36} maxBarSize={48}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CITY_COLORS[entry.name]}
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>

                {/* Baseline ghost bars */}
                {baseline && (
                  <Bar
                    dataKey="Baseline"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.2)"
                    strokeDasharray="5 4"
                    radius={[6, 6, 0, 0]}
                    barSize={36}
                    maxBarSize={48}
                    animationDuration={800}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

        </section>
      </main>
    </div>
  );
};

export default PolicyDashboard;