import { useEffect, useState } from "react";
import api from "../services/api";
import GridDashboard from "./GridDashboard";

function DashboardList({ onSelect, datasetId }) {
    const [dashboards, setDashboards] = useState([]);
    const [filters, setFilters] = useState({});
    const [charts, setCharts] = useState([]);

    useEffect(() => {
        api.get("/dashboards").then(res => setDashboards(res.data));
    }, []);

    const loadDashboard = async (dashboardId) => {
        const res = await api.get(`/dashboards/${dashboardId}`);
        onSelect(dashboardId, res.data);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this dashboard?")) {
            try {
                await api.delete(`/dashboards/${id}`);
                setDashboards(prev => prev.filter(d => d.id !== id));
            } catch (err) {
                console.error("Failed to delete dashboard", err);
                alert("Failed to delete dashboard");
            }
        }
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
                                style={{ width: '100%', justifyContent: 'space-between', textAlign: 'left', display: 'flex', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '8px' }}>📊</span> {d.name}
                                </div>
                                <button
                                    onClick={(e) => handleDelete(d.id, e)}
                                    style={{
                                        backgroundColor: '#ff4d4f',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '5px 12px',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                    title="Delete Dashboard"
                                >
                                    Delete
                                </button>
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
