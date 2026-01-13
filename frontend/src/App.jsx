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
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <img src={boclogo} alt="BOC Logo" className="header-logo" />
        <h1 className="header-title">BOC BI Platform</h1>
      </header>

      {/* Main Container */}
      <div className="app-body">
        {/* Sidebar Navigation - Left Rail */}
        {datasetId && (
          <nav className="app-sidebar">
            <div className="nav-section">
              <NavButton
                active={currentView === "dashboard"}
                onClick={() => setCurrentView("dashboard")}
                icon="📊"
                label="Report View"
              />
              <NavButton
                active={currentView === "data"}
                onClick={() => setCurrentView("data")}
                icon="🔢"
                label="Data View"
              />
              <NavButton
                active={currentView === "analytics"}
                onClick={() => setCurrentView("analytics")}
                icon="📈"
                label="Analytics"
              />
            </div>
          </nav>
        )}

        {/* Content Area */}
        <main className="main-content">
          <div className="page-container">
            {!datasetId ? (
              <div className="welcome-section">
                <div className="card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
                  <h2 style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', marginBottom: '1rem' }}>Welcome to BOC BI</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>
                    Unlock insights from your data with our advanced analytics platform.
                  </p>

                  <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
                    <DatasetUpload onUploadSuccess={handleUploadSuccess} />
                  </div>

                  <div style={{ textAlign: 'left', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📂</span> Recent Dashboards
                    </h3>
                    <DashboardList onSelect={handleDashboardSelect} datasetId={datasetId} />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {currentView === "data" && (
                  <div className="fade-in">
                    <h2 className="section-title">Data Profile</h2>
                    <div className="card">
                      <DatasetProfile datasetId={datasetId} />
                    </div>
                  </div>
                )}

                {currentView === "dashboard" && (
                  <div className="fade-in">
                    <Dashboard datasetId={datasetId} />
                  </div>
                )}

                {currentView === "analytics" && (
                  <div className="fade-in">
                    <h2 className="section-title">Advanced Analytics</h2>
                    <div className="card">
                      <AdvancedAnalytics datasetId={datasetId} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button
      className={`nav-button ${active ? 'active' : ''}`}
      onClick={onClick}
      title={label}
    >
      <span className="nav-icon">{icon}</span>
      <span className="nav-label">{label}</span>
    </button>
  )
}

export default App
