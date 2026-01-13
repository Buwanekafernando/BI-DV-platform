import { useState } from "react";
import api from "../services/api";
import ChartBuilder from "./ChartBuilder";
import FilterPanel from "./FilterPanel";
import ExportButtons from "./ExportButtons";

function Dashboard({ datasetId }) {
    const [charts, setCharts] = useState([]);
    const [filters, setFilters] = useState({});

    const addChart = () => {
        setCharts([...charts, { id: Date.now() }]);
    };

    const dashboardState = {
        name: "Sales Overview",
        dataset_id: datasetId,
        filters: filters,
        charts: charts.map(c => ({
            chart_type: c.chartType,
            x_axis: c.xAxis,
            y_axis: c.yAxis,
            aggregation: c.aggregation
        })),
        layout: { columns: 2 }
    };

    const saveDashboard = async () => {
        try {
            await api.post("/dashboards", dashboardState);
            alert("Dashboard saved successfully");
        } catch (e) {
            console.error("Failed to save dashboard", e);
            alert("Failed to save dashboard");
        }
    };


    return (
        <div style={{ marginTop: "40px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
            <h2>Dashboard Canvas</h2>

            <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
                <FilterPanel filters={filters} setFilters={setFilters} />
                <button onClick={addChart} style={{ padding: "8px 16px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>➕ Add Chart</button>
                <button onClick={saveDashboard} style={{ padding: "8px 16px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save Dashboard</button>
            </div>

            <div id="dashboard-canvas"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "30px",
                    marginTop: "20px",
                    minHeight: "400px",
                    border: "1px dashed #ccc",
                    padding: "20px",
                    background: "#f9f9f9"
                }}
            >
                {charts.length === 0 && <p style={{ gridColumn: "span 2", textAlign: "center", color: "#888" }}>No charts added. Click 'Add Chart' to begin.</p>}

                {charts.map(chart => (
                    <div key={chart.id} style={{ border: "1px solid #fff", padding: "10px", background: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                        <div style={{ textAlign: "right", marginBottom: "5px" }}>
                            <button onClick={() => setCharts(charts.filter(c => c.id !== chart.id))} style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}>✖</button>
                        </div>
                        <ChartBuilder
                            datasetId={datasetId}
                            filters={filters}
                        />
                    </div>
                ))}
            </div>

            {/* Removed ExportButtons for now as it needs a saved dashboard ID */}
        </div>
    );
}

export default Dashboard;