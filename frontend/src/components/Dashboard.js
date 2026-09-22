import React, { useCallback, useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import solarIcon from "../assets/solar.svg";
import dollarIcon from "../assets/dollar.svg";
import leafIcon from "../assets/leaf.svg";
import warningIcon from "../assets/warning.svg";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  const [usageData, setUsageData] = useState([]);
  const [predictedUsage, setPredictedUsage] = useState(null);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [anomalyEvents, setAnomalyEvents] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const intervalRef = useRef(null);

  const REFRESH_INTERVAL_MS = 4000;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const generateGraphAnomalies = useCallback((data) => {
    if (!Array.isArray(data) || data.length < 6) return [];
    const diffs = data.slice(1).map((item, index) => {
      const prev = data[index].usage;
      const curr = item.usage;
      const delta = curr - prev;
      return {
        id: index + 1,
        ts: item.time,
        usage: curr,
        delta,
        score: Math.abs(delta),
      };
    });

    // Deduplicate by time label so each clock time appears once (keep highest-score event per time)
    const byTime = {};
    const sorted = diffs.sort((a, b) => b.score - a.score);
    for (const event of sorted) {
      const time = new Date(event.ts);
      const timeLabel = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (byTime[timeLabel]) continue; // already have a higher-score event for this time
      const hour = time.getHours();
      const reason = (() => {
        if (event.delta > 0) {
          if (hour >= 5 && hour < 8) return "early morning building warm-up and facility startup";
          if (hour >= 8 && hour < 12) return "many students were attending labs and morning lectures";
          if (hour >= 12 && hour < 15) return "midday exams and classroom sessions caused heavier load";
          if (hour >= 15 && hour < 19) return "afternoon study groups and library demand pushed usage up";
          return "late evening campus activity and facility operations raised consumption";
        }
        if (hour >= 12 && hour < 16) return "a campus lull after morning labs completed";
        if (hour >= 5 && hour < 8) return "early campus systems were winding down after startup";
        return "much of the campus quieted down after peak activity";
      })();

      byTime[timeLabel] = {
        id: `${event.id}-${timeLabel}`,
        ts: event.ts,
        usage: event.usage,
        label: `${timeLabel} — ${reason}`,
      };
    }

    // Return up to 5 unique-time events preserving highest-score order
    return Object.values(byTime).slice(0, 5);
  }, []);

  const fetchUsage = useCallback(async () => {
    const res = await fetch("http://127.0.0.1:8000/usage?limit=50");
    if (!res.ok) {
      throw new Error("Backend unavailable");
    }
    const data = await res.json();
    setUsageData(data);
    setLastUpdated(new Date().toLocaleTimeString());
    const graphAnomalies = generateGraphAnomalies(data);
    setAnomalyCount(graphAnomalies.length);
    setAnomalyEvents(graphAnomalies);
  }, [generateGraphAnomalies]);

  const fetchPrediction = useCallback(async () => {
    const res = await fetch("http://127.0.0.1:8000/predict");
    if (!res.ok) {
      throw new Error("Backend unavailable");
    }
    const data = await res.json();
    setPredictedUsage(data.predicted_usage);
  }, []);

  const fetchAnomalies = useCallback(async () => {
    // Keep this endpoint for backend compatibility, but graph anomalies are derived from usage data.
    const res = await fetch("http://127.0.0.1:8000/anomaly");
    if (!res.ok) {
      throw new Error("Backend unavailable");
    }
    const data = await res.json();
    setAnomalyCount((Array.isArray(data) ? data.length : 0) || anomalyEvents.length);
  }, [anomalyEvents.length]);

  useEffect(() => {
    const refreshData = async () => {
      try {
        await Promise.all([fetchUsage(), fetchPrediction(), fetchAnomalies()]);
        setIsOffline(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setIsOffline(true);
        stopPolling();
      }
    };

    refreshData();
    intervalRef.current = setInterval(refreshData, REFRESH_INTERVAL_MS);

    return () => stopPolling();
  }, [fetchAnomalies, fetchPrediction, fetchUsage, stopPolling]);

  const currentUsage = usageData.length ? usageData[usageData.length - 1].usage : null;
  const usageDelta = usageData.length > 1 ? currentUsage - usageData[usageData.length - 2].usage : null;
  const chartLineColor = "#fbbf24";
  const chartFillTop = "rgba(251,191,36,0.32)";
  const chartFillBottom = "rgba(251,191,36,0.10)";
  const trendLabel = usageDelta !== null ? `${usageDelta >= 0 ? "+" : ""}${usageDelta.toFixed(1)} kWh` : "–";

  const chartData = {
    labels: usageData.map((d) => new Date(d.time).toLocaleTimeString()),
    datasets: [
      {
        label: "Energy Usage (kWh)",
        data: usageData.map((d) => d.usage),
        fill: true,
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, chartFillTop);
          gradient.addColorStop(1, chartFillBottom);
          return gradient;
        },
        borderColor: chartLineColor,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: chartLineColor,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        tension: 0.35,
      },
    ],
  };
  const modeStatus = isOffline ? "Offline" : usageData.length ? "Streaming" : "Initializing";
  const refreshLabel = isOffline ? "Stopped" : "4 sec";
  const dataCountLabel = usageData.length ? `${usageData.length} points` : "Waiting for data";

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#e5f3ff' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#e5f3ff' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  return (
    <div className="app-container">
      <div className="dashboard-hero-card card">
        <div className="hero-copy">
          <small className="eyebrow">Campus Pulse</small>
          <h2>Live campus energy operations</h2>
          <p>Visualize demand, spot spikes and keep campus energy running smarter in real time.</p>

          <div className="hero-meta">
            <div className="meta-item">
              <span className="meta-label">Current load</span>
              <strong>{currentUsage !== null ? `${currentUsage.toLocaleString()} kWh` : "Loading..."}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">1h trend</span>
              <strong>{trendLabel}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">Active anomalies</span>
              <strong>{anomalyCount}</strong>
            </div>
          </div>

          <div className="status-row">
            <span className={isOffline ? "badge warn" : "badge live"}>{isOffline ? "Offline" : "Live"}</span>
            <span>
              {isOffline
                ? "Backend unavailable — live updates stopped."
                : lastUpdated ? `Updated ${lastUpdated}` : "Fetching latest data..."}
            </span>
          </div>

          <div className="mode-details">
            <span className="mode-pill">Mode: Live Simulation</span>
            <span className="mode-pill">Refresh: {refreshLabel}</span>
            <span className="mode-pill">Status: {modeStatus}</span>
            <span className="mode-pill">Data points: {dataCountLabel}</span>
          </div>
        </div>

        <div className="hero-visual-panel">
          <img src={solarIcon} alt="Energy monitoring" className="dashboard-main-img" />
          <div className="hero-badge">Energy pulse, demand and sustainability insights</div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        <div className="kpi glow">
          <img src={solarIcon} alt="Solar" className="icon" />
          <div>
            <div className="label">Predicted Next Hour</div>
            <div className="value">{predictedUsage !== null ? `${predictedUsage.toLocaleString()} kWh` : "Loading..."}</div>
          </div>
        </div>
        <div className="kpi">
          <img src={dollarIcon} alt="Savings" className="icon" />
          <div>
            <div className="label">Estimated cost saved</div>
            <div className="value">$4,380</div>
          </div>
        </div>
        <div className="kpi">
          <img src={leafIcon} alt="Sustainability" className="icon" />
          <div>
            <div className="label">Carbon Saved</div>
            <div className="value">1.2 tons</div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid">
        {/* Chart Section */}
        <div className="card chart-card">
          <h3>Energy Usage Trends</h3>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Sidebar Anomalies */}
        <aside>
          <div className="card anomaly-card">
            <div className="page-header">
              <h3>Recent Anomalies</h3>
              <img src={warningIcon} alt="Warning" className="small-icon" />
            </div>
            <div className="badge warn">{anomalyCount} {anomalyCount === 1 ? "anomaly" : "anomalies"} detected</div>
            <div className="muted anomaly-list" style={{ marginTop: "14px" }}>
              <p>Recent findings:</p>
              <ul>
                {anomalyEvents.length > 0 ? (
                  anomalyEvents.map((event) => (
                    <li key={event.id}>
                      {event.label}: {event.usage.toLocaleString()} kWh at {new Date(event.ts).toLocaleTimeString()}
                    </li>
                  ))
                ) : (
                  <li>No anomalies detected yet.</li>
                )}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
