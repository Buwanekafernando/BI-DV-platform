import { useState } from "react";
import api from "../services/api";
import ChartBuilder from "./ChartBuilder";
import FilterPanel from "./FilterPanel";
import html2canvas from "html2canvas";
import ExportButtons from "./ExportButtons";

function Dashboard({ datasetId }) {
    const [charts, setCharts] = useState([]);
    const [filters, setFilters] = useState({});

    const addChart = () => {
        setCharts([...charts, {
            id: Date.now(),
            chart_type: "bar",
            x_axis: "",
            y_axis: "",
            aggregation: "sum"
        }]);
    };

    const updateChart = (id, config) => {
        setCharts(prev => prev.map(c => c.id === id ? { ...c, ...config } : c));
    };

    const downloadAsPNG = async () => {
        const canvas = document.getElementById("dashboard-canvas");
        if (!canvas) return;

        try {
            const image = await html2canvas(canvas, {
                useCORS: true,
                backgroundColor: "#ffffff",
                scale: 2 // Higher quality
            });
            const link = document.createElement("a");
            link.href = image.toDataURL("image/png");
            link.download = `${dashboardState.name || "dashboard"}.png`;
            link.click();
        } catch (e) {
            console.error("Failed to export PNG", e);
            alert("Failed to export PNG image");
        }
    };

    const saveDashboard = async () => {
        const dashboardState = {
            name: "Sales Overview",
            dataset_id: datasetId,
            filters: filters,
            charts: charts.map(c => ({
                chart_type: c.chart_type,
                x_axis: c.x_axis,
                y_axis: c.y_axis,
                aggregation: c.aggregation
            })),
            layout: { columns: 2 }
        };

        try {
            await api.post("/dashboards/", dashboardState);
            alert("Dashboard saved successfully! Preparing download...");
            // Automatically trigger download after save
            setTimeout(downloadAsPNG, 500);
        } catch (e) {
            console.error("Failed to save dashboard", e);
            alert("Failed to save dashboard: " + (e.response?.data?.detail || "Unknown error"));
        }
    };


    return (
        <div className="dashboard-container">
            <div className="dashboard-toolbar" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                background: "var(--color-background-surface)",
                borderRadius: "var(--radius-md)",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px"
            }}>
                <FilterPanel filters={filters} setFilters={setFilters} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={addChart} className="btn btn-primary">➕ Add Chart</button>
                    <button onClick={downloadAsPNG} className="btn btn-secondary" style={{ backgroundColor: 'var(--color-tertiary)', color: 'white' }}>🖼️ Download PNG</button>
                    <button onClick={saveDashboard} className="btn btn-success" style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>💾 Save Dashboard</button>
                </div>
            </div>

            <div id="dashboard-canvas"
                className="dashboard-canvas"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "20px",
                    minHeight: "500px",
                    padding: "20px",
                    border: "2px dashed var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "white"
                }}
            >
                {charts.length === 0 && (
                    <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", height: "100%" }}>
                        <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Your canvas is empty.</p>
                        <p>Click <strong>Add Chart</strong> to start building your dashboard.</p>
                    </div>
                )}

                {charts.map(chart => (
                    <div key={chart.id} className="chart-card" style={{
                        position: 'relative',
                        background: "white",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--shadow-md)",
                        padding: "20px",
                        border: "1px solid var(--border-color)"
                    }}>
                        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                            <button
                                onClick={() => setCharts(charts.filter(c => c.id !== chart.id))}
                                style={{
                                    color: "var(--color-error)",
                                    background: "rgba(255,0,0,0.1)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "28px",
                                    height: "28px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                }}
                                title="Remove Chart"
                            >✖</button>
                        </div>
                        <ChartBuilder
                            datasetId={datasetId}
                            filters={filters}
                            onUpdate={(config) => updateChart(chart.id, config)}
                        />
                    </div>
                ))}
            </div>

            {/* Removed ExportButtons for now as it needs a saved dashboard ID */}
        </div>
    );
}

export default Dashboard;