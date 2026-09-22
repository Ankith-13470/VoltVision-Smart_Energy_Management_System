import React, { useEffect, useState } from "react";
import leafIcon from "../assets/leaf.svg";

export default function PredictionsPage(){
  const [history, setHistory] = useState([]);
  const [predictedNext, setPredictedNext] = useState(null);
  const [confidencePct, setConfidencePct] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const rec = await fetch("http://127.0.0.1:8000/history").then((r) => r.json());
      const preds = [];
      for (let i = 3; i < rec.length; i++) {
        const last3 = rec.slice(i - 3, i).map((r) => Number(r.usage));
        const avg = Math.round((last3.reduce((a, b) => a + b, 0) / 3) * 100) / 100;
        preds.push({ time: rec[i].time, predicted: avg });
      }
      setHistory(preds.slice(-200));

      // compute a simple confidence estimate based on recent variance
      const recent = rec.slice(-24).map((r) => Number(r.usage));
      if (recent.length) {
        const mean = recent.reduce((a,b) => a+b, 0)/recent.length;
        const variance = recent.reduce((a,b) => a + Math.pow(b-mean,2), 0)/recent.length;
        const std = Math.sqrt(variance);
        const conf = Math.max(30, Math.min(99, Math.round(100 - (std/Math.max(1,mean))*100)));
        setConfidencePct(conf);
      }

      try {
        const p = await fetch("http://127.0.0.1:8000/predict").then(r => r.ok ? r.json() : null);
        if (p && p.predicted_usage !== undefined) setPredictedNext(Number(p.predicted_usage));
      } catch (e) {
        // ignore
      }
    }
    fetchData();
  }, []);

  const lastActual = history.length ? history[history.length-1].predicted : null;
  const delta = (predictedNext !== null && lastActual !== null) ? (predictedNext - lastActual) : null;

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <small className="eyebrow">Forecasting</small>
          <h2>Prediction History</h2>
          <p>Accurate hourly forecasts help campus planners reduce waste and optimize supply.</p>
        </div>
        <img src={leafIcon} alt="Forecast" className="page-header-img" />
      </div>

      

      <div className="card prediction-summary">
        <div className="summary-left">
          <div className="summary-kpi">
            <div className="kpi-label">Next hour prediction</div>
            <div className="kpi-value">{predictedNext !== null ? `${predictedNext.toLocaleString()} kWh` : 'Loading...'}</div>
          </div>
          <div className="summary-meta">
            <div className="meta-item">Confidence: <strong>{confidencePct !== null ? `${confidencePct}%` : '–'}</strong></div>
            <div className="meta-item">Delta vs last: <strong>{delta !== null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} kWh` : '–'}</strong></div>
          </div>
        </div>
        <div className="summary-right">
          <p className="muted">Tips: monitor upcoming HVAC schedules and shift non-critical loads.</p>
        </div>
      </div>

      <div className="card prediction-card">
        <ul>
          {history.length ? history.map((p,i)=>(
            <li key={i} className="prediction-row">
              <span>{new Date(p.time).toLocaleString()}</span>
              <strong>{p.predicted.toLocaleString()} kWh</strong>
            </li>
          )) : <li>No prediction history yet</li>}
        </ul>
      </div>
    </div>
  );
}
