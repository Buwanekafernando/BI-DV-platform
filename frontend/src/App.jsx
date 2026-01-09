import { useState } from 'react'

import './App.css'
import DatasetUpload from "./components/DatasetUpload";
import DatasetProfile from "./components/DatasetProfile";
import ChartBuilder from "./components/ChartBuilder";
import Dashboard from './components/Dashboard';
import DashboardList from './components/DashboardList';
import AdvancedAnalytics from './components/AdvancedAnalytics';
import boclogo from './assets/boclogo.png';

function App() {
  const [datasetId, setDatasetId] = useState(null);
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  const handleDashboardSelect = (dashboardId, dashboardData) => {
    setSelectedDashboard(dashboardData);
  };

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
