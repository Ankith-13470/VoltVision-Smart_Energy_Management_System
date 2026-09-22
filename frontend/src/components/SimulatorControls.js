import React, { useEffect, useState } from "react";

export default function SimulatorControls(){
  const [simulatorEnabled, setSimulatorEnabled] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const s = await fetch("http://127.0.0.1:8000/simulator").then(r => r.ok ? r.json() : null);
        if (s && typeof s.enabled === 'boolean') setSimulatorEnabled(Boolean(s.enabled));
      } catch (e) {}
    }
    load();
  }, []);

  async function toggleSimulator() {
    setLoading(true);
    try {
      const target = !simulatorEnabled;
      const res = await fetch("http://127.0.0.1:8000/simulator", {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: target })
      }).then(r => r.ok ? r.json() : null);
      if (res && typeof res.enabled === 'boolean') setSimulatorEnabled(Boolean(res.enabled));
    } catch (e) {
      // ignore
    }
    setLoading(false);
  }

  async function clearData(){
    /* eslint-disable-next-line no-restricted-globals */
    if(!confirm("Clear server data?")) return;
    await fetch("http://127.0.0.1:8000/clear", { method:"POST" });
    /* eslint-disable-next-line no-restricted-globals */
    alert("Cleared server data. Reload frontend to see changes.");
  }

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <small className="eyebrow">Simulator</small>
          <h2>Simulator Controls & Info</h2>
          <p className="muted">The backend simulator generates synthetic hourly electricity usage for demos and local testing. It seeds the DB on startup and appends new points while enabled.</p>
        </div>
      </div>

      <div className="card simulator-info">
        <h3>What it is</h3>
        <p className="muted">A lightweight generator that produces realistic, bounded campus-scale usage values when no real data source is connected. Useful for UI development, walkthroughs, and testing model behavior.</p>
        <h3 style={{marginTop:12}}>Runtime control</h3>
        <p className="muted">You can stop or start the simulator without restarting the backend. When stopped, existing data remains in the database.</p>
        <div style={{marginTop:8, display:'flex', alignItems:'center', gap:12}}>
          <div>Status: <strong>{simulatorEnabled === null ? 'unknown' : (simulatorEnabled ? 'enabled' : 'disabled')}</strong></div>
          <button className={simulatorEnabled ? 'btn-secondary' : 'btn'} onClick={toggleSimulator} disabled={loading}>
            {loading ? 'Updating...' : (simulatorEnabled ? 'Disable Simulator' : 'Enable Simulator')}
          </button>
          <button className="btn-secondary" onClick={clearData}>Clear Server Data</button>
        </div>
        
      </div>
    </div>
  );
}
