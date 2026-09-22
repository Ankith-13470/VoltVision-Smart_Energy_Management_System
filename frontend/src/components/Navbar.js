import React from "react";
import { Link } from "react-router-dom";

export default function Navbar(){
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">V</span>
        <span className="brand-name">VoltVision</span>
      </div>
      <div className="navbar-links">
        <Link className="nav-link nav-accent" to="/">Home</Link>
        <Link className="nav-link nav-accent" to="/dashboard">Dashboard</Link>
        <Link className="nav-link nav-accent" to="/data">Data Table</Link>
        <Link className="nav-link nav-accent" to="/anomalies">Anomalies</Link>
        <Link className="nav-link nav-accent" to="/predictions">Predictions</Link>
        <Link className="nav-link nav-accent" to="/simulator">Simulator</Link>
      </div>
    </nav>
  );
}
