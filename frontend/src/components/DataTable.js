import React, { useEffect, useState } from "react";
export default function DataTable(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{ fetch("http://127.0.0.1:8000/history").then(r=>r.json()).then(setRows).catch(()=>setRows([])); },[]);
  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <small className="eyebrow">Historic Usage</small>
          <h2>Data Table</h2>
          <p>Browse recorded usage, time stamps, and forecast inputs from the dataset.</p>
        </div>
      </div>
      <div className="table-wrap card">
        <div className="table-title">Total records: {rows.length}</div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Index</th><th>Time</th><th>Usage (kWh)</th></tr>
            </thead>
            <tbody>
              {rows.map((r,i)=>(
                <tr key={i}><td>{i+1}</td><td>{new Date(r.time).toLocaleString()}</td><td>{Number(r.usage).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
