import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Shield, Zap, Activity, Globe,
  Thermometer, Droplets, Sun,
  Play, ChevronDown, Calendar,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import "./GovernmentDashboard.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const API = "http://localhost:5000";

const RANGE_OPTIONS = [
  { value: "next-hour",     label: "Next Hour"     },
  { value: "next-day",      label: "Next Day"      },
  { value: "next-week",     label: "Next Week"     },
  { value: "next-month",    label: "Next Month"    },
  { value: "next-year",     label: "Next Year"     },
  { value: "current-year",  label: "Current Year"  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const GovernmentDashboard = () => {
  // Chart
  const [chartData,    setChartData]    = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Simulation
  const [simParams,      setSimParams]      = useState({ temp: 30, humidity: 50, solar: 500 });
  const [initialWeather, setInitialWeather] = useState({ temp: 30, humidity: 50, solar: 500 });
  const [isSimulating,   setIsSimulating]   = useState(false);

  // Time range
  const [selectedRange, setSelectedRange] = useState("next-day");
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const dropdownRef = useRef(null);

  // ── 1. On mount: fetch live Mumbai weather & sync sliders ──────────────────
  useEffect(() => {
    fetch(`${API}/api/initial-state`)
      .then(r => r.json())
      .then(data => {
        setInitialWeather(data.weather);
        setSimParams(data.weather);
      })
      .catch(e => console.warn("initial-state fetch failed:", e));
  }, []);

  // ── 2. Fetch forecast whenever range changes ──────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    const fetchForecast = async () => {
      setLoading(true);
      try {
        // next-year uses model inference endpoint, others use forecast endpoint
        const url = selectedRange === "next-year"
          ? `${API}/api/forecast/yearly`
          : selectedRange === "current-year"
          ? `${API}/api/forecast/current-year`
          : `${API}/api/forecast?range=${selectedRange}&offset=0`;

        const res  = await fetch(url, { signal: controller.signal });
        const raw  = await res.json();
        // Guard: recharts requires an array — API errors return objects
        setChartData(Array.isArray(raw) ? raw : []);
      } catch (e) {
        if (e.name !== "AbortError")
          console.error("Forecast fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
    return () => controller.abort();
  }, [selectedRange]);

  // ── 3. Dropdown handler ────────────────────────────────────────────────────
  const handleRangeSelect = (value) => {
    setSelectedRange(value);
    setDropdownOpen(false);
  };

  // ── 4. Close dropdown on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── 5. Run Simulation — POST to backend with weather overlay ──────────────
  // Note: next-year view is locked to model inference — simulation does not apply
  const runSimulation = async () => {
    if (selectedRange === "next-year" || selectedRange === "current-year") return;
    setIsSimulating(true);
    try {
      const res = await fetch(`${API}/api/forecast`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          range:  selectedRange,
          offset: 0,
          params: simParams,
        }),
      });
      const raw = await res.json();
      setChartData(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error("Simulation POST failed, using local fallback:", e);
      setChartData(prev => prev.map(point => {
        const dTemp  = (simParams.temp     - initialWeather.temp)     * 2.1;
        const dHumid = (simParams.humidity - initialWeather.humidity) / 10 * 1.5;
        const dSolar = (simParams.solar    - initialWeather.solar)    * -0.005;
        return { ...point, predicted: Math.round(point.predicted + dTemp + dHumid + dSolar) };
      }));
    } finally {
      setIsSimulating(false);
    }
  };

  // ─── Derived ────────────────────────────────────────────────────────────────
  const currentRangeLabel = RANGE_OPTIONS.find(o => o.value === selectedRange)?.label ?? "Next Day";
  const nextYear          = new Date().getFullYear() + 1;
  const isYearlyView      = selectedRange === "next-year" || selectedRange === "current-year";
  const unitLabel         = isYearlyView ? "MU" : "MW";

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="icon-box">
            <Shield size={28} color="white" />
          </div>
          <div>
            <h1>GRID OVERSIGHT COMMAND</h1>
            <p>SECURE TERMINAL • LEVEL 4 ACCESS</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Badge variant="outline" className="header-badge">
            <div className="status-dot" /> SYSTEM ONLINE
          </Badge>
        </div>
      </div>

      {/* METRICS */}
      <div className="metrics-grid">
        <StatCard title="Active Grid Load" value="142.5 MW" sub="Peak Demand"  icon={Zap}      color="#3b82f6" />
        <StatCard title="System Stability"  value="99.8%"   sub="Nominal"      icon={Activity} color="#10b981" />
        <StatCard title="Active Nodes"      value="1,248"   sub="Global"       icon={Globe}    color="#cbd5e1" />
        <StatCard title="Model Accuracy"    value="98.2%"   sub="XGBoost-V4"  icon={Shield}   color="#f59e0b" />
      </div>

      {/* MAIN GRID */}
      <div className="main-content-grid">

        {/* SIMULATION PANEL */}
        <Card className="control-panel">
          <CardHeader>
            <CardTitle className="panel-title">SIMULATION ENGINE</CardTitle>
          </CardHeader>
          <CardContent className="panel-content">
            <ControlSlider
              label="Temperature" value={simParams.temp}     unit="°C" icon={Thermometer}
              min={10} max={50}
              set={v => setSimParams(p => ({ ...p, temp:     parseInt(v) }))}
            />
            <ControlSlider
              label="Humidity"    value={simParams.humidity} unit="%"  icon={Droplets}
              min={0}  max={100}
              set={v => setSimParams(p => ({ ...p, humidity: parseInt(v) }))}
            />
            <ControlSlider
              label="Solar Index" value={simParams.solar}    unit=""   icon={Sun}
              min={0}  max={1000}
              set={v => setSimParams(p => ({ ...p, solar:    parseInt(v) }))}
            />

            <Button
              className="run-btn"
              onClick={runSimulation}
              disabled={isSimulating || selectedRange === "next-year" || selectedRange === "current-year"}
              title={selectedRange === "next-year" || selectedRange === "current-year" ? "This view uses live model inference — simulation not applicable" : ""}
            >
              {isSimulating ? "CALCULATING…" : (selectedRange === "next-year" || selectedRange === "current-year") ? "MODEL LOCKED" : "RUN SIMULATION"}
              {!isSimulating && selectedRange !== "next-year" && selectedRange !== "current-year" && <Play size={16} style={{ marginLeft: 8 }} />}
            </Button>
          </CardContent>
        </Card>

        {/* CHART PANEL */}
        <Card className="chart-panel">
          <CardHeader className="chart-header">

            {/* Title + Dropdown row */}
            <div className="chart-header-top">
              <CardTitle>
                {selectedRange === "next-year"
                  ? `Monthly Net Drawl — ${nextYear}`
                  : selectedRange === "current-year"
                  ? `Monthly Net Drawl — ${nextYear - 1}`
                  : "System-Wide Load Forecasting"}
              </CardTitle>

              <div className="tr-dropdown-wrap" ref={dropdownRef}>
                <button
                  className="tr-dropdown-trigger"
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={dropdownOpen}
                >
                  <Calendar size={14} className="tr-cal-icon" />
                  <span>{currentRangeLabel}</span>
                  <ChevronDown
                    size={14}
                    className={`tr-chevron ${dropdownOpen ? "open" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <ul className="tr-dropdown-menu" role="listbox">
                    {RANGE_OPTIONS.map(opt => (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={selectedRange === opt.value}
                        className={`tr-dropdown-item ${selectedRange === opt.value ? "active" : ""}`}
                        onClick={() => handleRangeSelect(opt.value)}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* model inference badge */}
            {(selectedRange === "next-year" || selectedRange === "current-year") && (
              <div className="tr-model-badge">
                <span className="tr-model-dot" />
                LIVE MODEL INFERENCE · XGBoost · {selectedRange === "next-year" ? nextYear : nextYear - 1}
              </div>
            )}

            {/* Legend */}
            <div className="chart-legend">
              <span className="legend-item"><span className="dot purple" /> AI Forecast</span>
            </div>
          </CardHeader>

          <CardContent>
            <div style={{ width: "100%", height: "350px", minHeight: "350px", minWidth: 0 }}>
              {/* Unit info block */}
              <div className="chart-unit-info">
                <span className="chart-unit-dot" />
                Output in <b>{unitLabel}</b> &nbsp;·&nbsp;
                {isYearlyView ? "MU = Million Units (MWh × 1000)" : "MW = Megawatts (instantaneous load)"}
              </div>
              {loading ? (
                <div className="chart-loading">
                  <span>FETCHING GRID DATA…</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--glass-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="time"
                      stroke="var(--text-muted)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--text-muted)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={["dataMin - 20", "dataMax + 20"]}
                      label={{
                        value: unitLabel,
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        style: { fill: "var(--text-muted)", fontSize: 11, fontFamily: "monospace" }
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--glass-bg)",
                        borderColor:     "var(--glass-border)",
                        borderRadius:    "8px",
                        color:           "var(--text-main)",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      fill="url(#forecastGlow)"
                      fillOpacity={1}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ─── Sub Components ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <Card className="stat-card">
    <CardHeader className="stat-header">
      <span className="stat-title">{title}</span>
      <Icon size={18} color={color} />
    </CardHeader>
    <CardContent>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </CardContent>
  </Card>
);

const ControlSlider = ({ label, value, unit, icon: Icon, set, min, max }) => (
  <div className="slider-group">
    <div className="slider-label">
      <div className="slider-info">
        <Icon size={14} className="icon-blue" />
        <span>{label}</span>
      </div>
      <span className="slider-val">{value}{unit}</span>
    </div>
    <input
      type="range"
      className="custom-range"
      value={value}
      min={min}
      max={max}
      onChange={e => set(e.target.value)}
    />
  </div>
);

export default GovernmentDashboard;