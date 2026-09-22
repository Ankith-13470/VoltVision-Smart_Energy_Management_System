import React from "react";
import energyImg from "../assets/bulb.svg";
import solarImg from "../assets/solar.svg";
import leafImg from "../assets/leaf.svg";

export default function HeroBanner() {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <small className="eyebrow">Campus energy intelligence</small>
        <h1>VoltVision</h1>
        <p>Empowering campuses through predictive usage, real-time alerts, and sustainable operations.</p>
        <div className="hero-actions">
          <button className="btn hero-btn">Explore Dashboard</button>
          <button className="btn btn-secondary">View Predictions</button>
        </div>
        <div className="hero-features">
          <div className="hero-feature">
            <img src={energyImg} alt="Live usage" />
            <span>Live usage monitoring</span>
          </div>
          <div className="hero-feature">
            <img src={solarImg} alt="Solar analytics" />
            <span>Solar and demand analytics</span>
          </div>
          <div className="hero-feature">
            <img src={leafImg} alt="Carbon savings" />
            <span>Carbon saving guidance</span>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <img src={solarImg} alt="Energy analytics" className="hero-img" />
        <div className="hero-deco-circle" />
      </div>
    </div>
  );
}
