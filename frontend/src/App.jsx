import { useState } from 'react'
import './App.css'
import DatasetUpload from "./components/DatasetUpload";
import DatasetList from "./components/DatasetList";
import DatasetProfile from "./components/DatasetProfile";
import ChartBuilder from "./components/ChartBuilder";
import Dashboard from './components/Dashboard';
import DashboardList from './components/DashboardList';

import Login from './components/Login';
import DataPreparation from './components/DataPreparation';
import MeasureBuilder from './components/MeasureBuilder';
import boclogo from './assets/boclogo.png';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainApp() {
  const { user, logout } = useAuth();
  const [datasetId, setDatasetId] = useState(null);
  const [currentView, setCurrentView] = useState("data"); // 'data', 'prep', 'modeling', 'dashboard', 'analytics'
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

  // If not logged in, show Login screen
  if (!user) {
    return <Login />;
  }

  // Modern BI Layout
  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={boclogo} alt="BOC Logo" className="header-logo" />
          <h1 className="header-title">BOC BI Analytics</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Welcome, <strong>{user.username || user.email}</strong></span>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Logout</button>
        </div>
      </header>

      {/* Main Container */}
      <div className="app-body">
        {/* Sidebar Navigation - Left Rail */}
        {datasetId && (
          <nav className="app-sidebar">
            <div className="nav-section">
              <NavButton
                active={false}
                onClick={() => setDatasetId(null)}
                icon="🏠"
                label="Home"
              />
              <div style={{ margin: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
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

              <div style={{ margin: 'var(--spacing-md) 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}></div>
              <NavButton
                active={currentView === "prep"}
                onClick={() => setCurrentView("prep")}
                icon="🛠️"
                label="Prepare Data"
              />
              <NavButton
                active={currentView === "modeling"}
                onClick={() => setCurrentView("modeling")}
                icon="📐"
                label="Data Modeling"
              />
            </div>
          </nav>
        )}

        {/* Content Area */}
        <main className="main-content">
          <div className="page-container">
            {!datasetId ? (
              <div className="welcome-section">
                <div className="card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '4rem var(--spacing-lg)' }}>
                  <h1 style={{ fontSize: '2.5rem', color: 'var(--color-secondary-maroon)', marginBottom: 'var(--spacing-md)' }}>BOC Analytics Platform</h1>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                    Unlock insights from your financial data with our secure, high-performance business intelligence system.
                  </p>

                  <div style={{ textAlign: 'left', marginBottom: 'var(--spacing-xl)' }}>
                    <DatasetUpload onUploadSuccess={handleUploadSuccess} />
                  </div>

                  <div style={{ textAlign: 'left', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--spacing-xl)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
                      <div>
                        <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <span>📄</span> Your Datasets
                        </h3>
                        <DatasetList onSelect={handleUploadSuccess} />
                      </div>
                      <div>
                        <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <span>📂</span> Your Dashboards
                        </h3>
                        <DashboardList onSelect={handleDashboardSelect} datasetId={datasetId} />
                      </div>
                    </div>
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
                    <Dashboard datasetId={datasetId} initialData={selectedDashboard} />
                  </div>
                )}



                {currentView === "prep" && (
                  <div className="fade-in">
                    <DataPreparation datasetId={datasetId} />
                  </div>
                )}

                {currentView === "modeling" && (
                  <div className="fade-in">
                    <MeasureBuilder datasetId={datasetId} />
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

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App
