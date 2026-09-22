import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import DataTable from "./components/DataTable";
import AnomaliesPage from "./components/AnomaliesPage";
import PredictionsPage from "./components/PredictionsPage";
import SimulatorControls from "./components/SimulatorControls";

// Optional: Framer Motion for smooth transitions
import { motion } from "framer-motion";

export default function App() {
  return (
    <Router>
      <div className="bg-overlay">
        <Navbar />
        <div className="app-container">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <HomePage />
                </motion.div>
              }
            />
            <Route
              path="/dashboard"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Dashboard />
                </motion.div>
              }
            />
            <Route path="/data" element={<DataTable />} />
            <Route path="/anomalies" element={<AnomaliesPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/simulator" element={<SimulatorControls />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

