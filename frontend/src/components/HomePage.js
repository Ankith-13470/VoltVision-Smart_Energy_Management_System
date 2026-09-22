import React from "react";
import { Link } from "react-router-dom";
import bulbIcon from "../assets/bulb.svg";
import solarIcon from "../assets/solar.svg";
import leafIcon from "../assets/leaf.svg";
import bgImage from "../assets/bg_energy.png";

export default function HomePage() {
  return (
    <div
      className="home-page"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(3, 9, 21, 0.88), rgba(4, 14, 32, 0.94)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
      }}
    >
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="eyebrow">Welcome to VoltVision</span>
          <h1>Energy insights for a sustainable campus future.</h1>
          <p>
            Discover real-time usage trends, intelligent predictions and green
            initiatives all in one place.
          </p>
          <div className="home-actions">
            <Link to="/dashboard" className="btn">
              Explore Dashboard
            </Link>
            <Link to="/data" className="btn btn-secondary">
              View Data Table
            </Link>
          </div>
          <div className="home-highlight-grid">
            <div className="highlight-card">
              <span>71%</span>
              <p>Campus energy optimized with predictive analytics.</p>
            </div>
            <div className="highlight-card">
              <span>24/7</span>
              <p>Real-time monitoring and alerts for peak loads.</p>
            </div>
            <div className="highlight-card">
              <span>Eco+</span>
              <p>Actionable insights for sustainability initiatives.</p>
            </div>
          </div>
        </div>
        <div className="home-hero-visual">
          <div className="home-hero-card">
            <img src={bulbIcon} alt="Efficiency" />
            <div>
              <strong>Smart efficiency</strong>
              <p>Monitor energy use with precision.</p>
            </div>
          </div>
          <div className="home-hero-card">
            <img src={solarIcon} alt="Solar" />
            <div>
              <strong>Renewable-ready</strong>
              <p>Track solar and sustainable gains.</p>
            </div>
          </div>
          <div className="home-hero-card">
            <img src={leafIcon} alt="Sustainability" />
            <div>
              <strong>Green planning</strong>
              <p>Reduce waste with actionable forecasts.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="home-features">
        <h2>Why choose VoltVision?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Live energy monitoring</h3>
            <p>See usage patterns and spikes in real time.</p>
          </div>
          <div className="feature-card">
            <h3>Forecasting engine</h3>
            <p>Predict the next hour to optimize load and cost.</p>
          </div>
          <div className="feature-card">
            <h3>Impact tracking</h3>
            <p>Measure sustainability gains from campus initiatives.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
