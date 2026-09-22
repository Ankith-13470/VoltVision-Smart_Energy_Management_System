import React, { useEffect, useState } from "react";
import warningImg from "../assets/warning.svg";
export default function AnomaliesPage(){
  const [anoms, setAnoms] = useState([]);
  useEffect(()=>{ fetch("http://127.0.0.1:8000/anomaly").then(r=>r.json()).then(setAnoms).catch(()=>setAnoms([])); },[]);
  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <small className="eyebrow">Anomaly Detection</small>
          <h2>Recent Alerts</h2>
          <p>Review unexpected usage spikes and schedule follow-up efficiency checks.</p>
        </div>
        <img src={warningImg} alt="Alerts" className="page-header-img" />
      </div>
      <div className="card anomaly-card">
        {anoms.length ? (
          <ul>
            {anoms.map((a,i)=>(
              <li key={i}>
                {new Date(a.time).toLocaleString()} → {Number(a.usage).toLocaleString()} kWh
              </li>
            ))}
          </ul>
        ) : (
          <p>No anomalies detected</p>
        )}
      </div>
      <div className="recommendation-card card" style={{ marginTop: 18 }}>
        <h3>Recommendations to Reduce Energy Consumption</h3>
        <p className="muted">Practical, campus-led actions to lower peaks and improve efficiency.</p>
        <ul className="recommendation-list">
          <li><strong>Adjust HVAC schedules:</strong> Shift start times and setback temperatures during low occupancy.</li>
          <li><strong>Consolidate high-load activities:</strong> Stagger labs and equipment-heavy sessions to avoid simultaneous peaks.</li>
          <li><strong>Implement demand response:</strong> Pre-cool or pre-heat buildings off-peak and reduce load during alerts.</li>
          <li><strong>Enable smart controls:</strong> Use occupancy sensors and building automation to power down unused zones.</li>
          <li><strong>Upgrade lighting & equipment:</strong> Convert to LED and opt for energy-efficient lab instruments where possible.</li>
        </ul>
      </div>
    </div>
  );
}
