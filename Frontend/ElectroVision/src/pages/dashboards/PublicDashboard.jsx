import React, { useState, useEffect } from "react";
import { Zap, Leaf, TrendingUp, AlertTriangle, CheckCircle, Wind, Thermometer, Clock } from "lucide-react";
import "./PublicDashboard.css";

const API = "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LoadBar = ({ pct, critical }) => (
  <div className="load-bar-track">
    <div
      className={`load-bar-fill ${critical ? "critical" : pct > 80 ? "peak" : "normal"}`}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
    {[25, 50, 75].map(m => (
      <div key={m} className="load-bar-marker" style={{ left: `${m}%` }} />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PublicDashboard = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API}/api/public/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(false);
    } catch (e) {
      console.error("Public status fetch failed:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount, then refresh every 60 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="pub-loading">
      <div className="pub-loading-spinner" />
      <span>Connecting to grid…</span>
    </div>
  );

  if (error) return (
    <div className="pub-loading">
      <AlertTriangle size={28} color="var(--accent)" />
      <span>Could not reach grid API. Is the server running?</span>
    </div>
  );

  const { current_mw, capacity_mw, load_pct, is_peak, is_critical,
          renewable_pct, weather, tip, co2_saved_tons, timestamp } = data;

  const statusLabel = is_critical ? "Critical" : is_peak ? "High Demand" : "Stable";
  const StatusIcon  = is_critical ? AlertTriangle : is_peak ? Zap : CheckCircle;

  return (
    <div className="pub-container">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="pub-header">
        <div className="pub-header-icon">
          <Zap size={22} />
        </div>
        <div>
          <h1>Maharashtra Grid</h1>
          <p>Live public energy dashboard</p>
        </div>
        <div className="pub-timestamp">
          <Clock size={13} />
          Updated {timestamp}
        </div>
      </header>

      {/* ── GRID ───────────────────────────────────────────────────────── */}
      <div className="pub-grid">

        {/* Card 1 — Current Load */}
        <div className={`pub-card load-card ${is_critical ? "card-critical" : is_peak ? "card-peak" : ""}`}>
          <div className="pub-card-label">
            <Zap size={14} className="label-icon" />
            Current Grid Load
          </div>
          <div className="pub-big-number">
            {current_mw.toLocaleString()}
            <span className="pub-unit">MW</span>
          </div>
          <LoadBar pct={load_pct} critical={is_critical} />
          <div className="pub-load-meta">
            <span>{load_pct}% of capacity</span>
            <span className={`pub-status-badge ${is_critical ? "badge-critical" : is_peak ? "badge-peak" : "badge-ok"}`}>
              <StatusIcon size={11} />
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Card 2 — Grid Status */}
        <div className={`pub-card status-card ${is_critical ? "status-critical" : is_peak ? "status-peak" : "status-ok"}`}>
          <div className="pub-card-label-light">Grid Status</div>
          <div className="pub-status-main">
            <StatusIcon size={36} className="status-big-icon" />
            <div>
              <div className="pub-status-text">{statusLabel}</div>
              <div className="pub-status-sub">
                {is_critical
                  ? "Reduce usage now"
                  : is_peak
                  ? "Avoid heavy appliances"
                  : "All systems normal"}
              </div>
            </div>
          </div>
          <div className="pub-weather-row">
            <span><Thermometer size={13} /> {weather.temp}°C</span>
            <span><Wind size={13} /> {weather.humidity}% RH</span>
          </div>
        </div>

        {/* Card 3 — Renewables */}
        <div className="pub-card renew-card">
          <div className="pub-card-label">
            <Leaf size={14} className="label-icon-green" />
            Renewable Mix
          </div>
          <div className="pub-big-number green">
            {renewable_pct}
            <span className="pub-unit">%</span>
          </div>
          <div className="renew-bar-track">
            <div className="renew-bar-fill" style={{ width: `${renewable_pct}%` }} />
          </div>
          <div className="pub-co2">
            <Leaf size={12} />
            {co2_saved_tons.toLocaleString()} tonnes CO₂ offset today
          </div>
        </div>

        {/* Card 4 — Capacity */}
        <div className="pub-card capacity-card">
          <div className="pub-card-label">
            <TrendingUp size={14} className="label-icon" />
            Grid Capacity
          </div>
          <div className="pub-big-number">
            {capacity_mw.toLocaleString()}
            <span className="pub-unit">MW</span>
          </div>
          <div className="capacity-breakdown">
            <div className="cap-row">
              <span>In use</span>
              <span className="cap-val used">{current_mw.toLocaleString()} MW</span>
            </div>
            <div className="cap-row">
              <span>Available</span>
              <span className="cap-val avail">{(capacity_mw - current_mw).toLocaleString()} MW</span>
            </div>
          </div>
        </div>

        {/* Card 5 — Tip (full width) */}
        <div className="pub-card tip-card">
          <div className="tip-icon-wrap">
            <Zap size={18} />
          </div>
          <div>
            <div className="tip-eyebrow">Energy Saving Tip</div>
            <p className="tip-body">{tip}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicDashboard;