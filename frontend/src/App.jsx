import { useState } from 'react'
import { useEffect } from "react";

import api from "./services/api";
import './App.css'
import Login from "./components/Login";
import DatasetUpload from "./components/DatasetUpload";
import DatasetProfile from "./components/DatasetProfile";
import ChartBuilder from "./components/ChartBuilder";
import Dashboard from './components/Dashboard';
import DashboardList from './components/DashboardList';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import boclogo from './assets/boclogo.png';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [datasetId, setDatasetId] = useState(null);
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleDashboardSelect = (dashboardId, dashboardData) => {
    setSelectedDashboard(dashboardData);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <img src={boclogo} alt="BOC Logo" style={{ maxWidth: "200px", marginBottom: "20px" }} />
      <h1>BOC BI Analytics Platform</h1>

      <DashboardList onSelect={handleDashboardSelect} datasetId={datasetId} />

      <DatasetUpload onUploadSuccess={setDatasetId} />

      {datasetId && (
        <>
          <p><strong>Dataset ID:</strong> {datasetId}</p>
          <DatasetProfile datasetId={datasetId} />
          <ChartBuilder datasetId={datasetId} />
          <AdvancedAnalytics datasetId={datasetId} />
          <Dashboard datasetId={datasetId} />
        </>
      )}
    </div>
  )
}

export default App
