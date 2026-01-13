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
  const [currentView, setCurrentView] = useState("data"); // 'data', 'dashboard', 'analytics'
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  const handleUploadSuccess = (id) => {
    setDatasetId(id);
    setCurrentView("data");
  };

  const handleDashboardSelect = (dashboardId, dashboardData) => {
    setSelectedDashboard(dashboardData);
    setDatasetId(dashboardData.dataset_id); // If dashboard has a dataset
    setCurrentView("dashboard");
  };

  // Modern BI Layout
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Top Header */}
      <header style={{
        height: "50px",
        background: "#f3f2f1",
        display: "flex",
        alignItems: "center",
        padding: "0 15px",
        borderBottom: "1px solid #e1dfdd"
      }}>
        <img src={boclogo} alt="BOC Logo" style={{ height: "30px", marginRight: "10px" }} />
        <h1 style={{ fontSize: "16px", fontWeight: "600", color: "#323130", margin: 0 }}>BOC BI Platform</h1>
      </header>

      {/* Main Container */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar Navigation - Left Rail */}
        {datasetId && (
          <nav style={{
            width: "48px",
            background: "#252423",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "10px"
          }}>
            <NavButton
              active={currentView === "dashboard"}
              onClick={() => setCurrentView("dashboard")}
              icon="📊"
              label="Report"
            />
            <NavButton
              active={currentView === "data"}
              onClick={() => setCurrentView("data")}
              icon="🔢"
              label="Data"
            />
            <NavButton
              active={currentView === "analytics"}
              onClick={() => setCurrentView("analytics")}
              icon="📈"
              label="Analytics"
            />
          </nav>
        )}

        {/* Content Area */}
        <main style={{ flex: 1, padding: "0", background: "#faf9f8", overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {!datasetId ? (
            <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", overflowY: "auto" }}>
              <h2 style={{ color: "#323130" }}>Welcome to BOC BI</h2>
              <p style={{ color: "#605e5c", marginBottom: "30px" }}>Get started by uploading your data or opening a saved dashboard.</p>

              <div style={{ background: "white", padding: "30px", borderRadius: "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "30px", borderTop: "3px solid #0078d4" }}>
                <DatasetUpload onUploadSuccess={handleUploadSuccess} />
              </div>

              <div style={{ background: "white", padding: "30px", borderRadius: "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <h3 style={{ marginTop: 0 }}>Recent Dashboards</h3>
                <DashboardList onSelect={handleDashboardSelect} datasetId={datasetId} />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {currentView === "data" && (
                <div>
                  <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>Data View</h2>
                  <DatasetProfile datasetId={datasetId} />
                </div>
              )}

              {currentView === "dashboard" && (
                <Dashboard datasetId={datasetId} />
              )}

              {currentView === "analytics" && (
                <div>
                  <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>Advanced Analytics</h2>
                  <AdvancedAnalytics datasetId={datasetId} />
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        background: active ? "#3b3a39" : "transparent",
        border: "none",
        borderLeft: active ? "3px solid #0078d4" : "3px solid transparent",
        width: "100%",
        height: "48px",
        color: "white",
        fontSize: "18px",
        cursor: "pointer",
        marginBottom: "5px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "background 0.2s"
      }}
    >
      {icon}
    </button>
  )
}

export default App
