import { useEffect, useState } from "react";
import api from "../services/api";
import GridDashboard from "./GridDashboard";

function DashboardList({ onSelect, datasetId }) {
    const [dashboards, setDashboards] = useState([]);
    const [filters, setFilters] = useState({});
    const [charts, setCharts] = useState([]);

    useEffect(() => {
        api.get("/dashboard/dashboards").then(res => setDashboards(res.data));
    }, []);

    const loadDashboard = async (dashboardId) => {
        const res = await api.get(`/dashboard/dashboards/${dashboardId}`);
        onSelect(dashboardId, res.data);
    };

    return (
        <div className="dashboard-list-container">
            {/* <h3>Saved Dashboards</h3> - Title removed as it's usually handled by parent or empty state */}
            {dashboards.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {dashboards.map(d => (
                        <li key={d.id} style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => loadDashboard(d.id)}
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                            >
                                <span style={{ marginRight: '8px' }}>📊</span> {d.name}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No saved dashboards found.</p>
            )}

            {datasetId && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <GridDashboard datasetId={datasetId} />
                </div>
            )}
        </div>
    );
}

export default DashboardList;
