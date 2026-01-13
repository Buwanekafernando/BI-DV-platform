import { useEffect, useState } from "react";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";

import api from "../services/api";

function ChartBuilder({ datasetId }) {
    const [columns, setColumns] = useState([]);
    const [xAxis, setXAxis] = useState("");
    const [yAxis, setYAxis] = useState("");
    const [aggregation, setAggregation] = useState("sum");
    const [chartType, setChartType] = useState("bar");
    const [sortOrder, setSortOrder] = useState("desc");
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!datasetId) return;

        // Correct endpoint: /datasets/{id}/profile
        api.get(`/datasets/${datasetId}/profile`)
            .then(res => {
                setColumns(res.data.columns.map(c => c.name));
            })
            .catch(err => console.error("Failed to load columns", err));
    }, [datasetId]);

    const generateChart = async () => {
        if (!xAxis || !yAxis) {
            setError("Please select both X and Y axes");
            return;
        }
        setError("");
        setLoading(true);

        try {
            // Map UI state to backend QueryRequest
            const payload = {
                group_by: [xAxis],
                aggregations: [
                    { column: yAxis, function: aggregation }
                ],
                sort_by: [
                    { column: `${yAxis}_${aggregation}`, order: sortOrder }
                ],
                limit: 20
            };

            const response = await api.post(`/query/${datasetId}`, payload);
            setChartData(response.data.data);
        } catch (err) {
            setError("Failed to generate chart");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // The backend returns keys like "value_sum"
    const dataKeyY = `${yAxis}_${aggregation}`;

    return (
        <div className="chart-builder">
            <h3 style={{ marginBottom: "20px", color: "var(--color-secondary)" }}>Chart Builder</h3>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
                background: "var(--color-background-surface)",
                padding: "20px",
                borderRadius: "var(--radius-md)"
            }}>
                <div className="form-group">
                    <label className="form-label">Chart Type</label>
                    <select value={chartType} onChange={e => setChartType(e.target.value)} className="form-select">
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">X-Axis (Group By)</label>
                    <select value={xAxis} onChange={e => setXAxis(e.target.value)} className="form-select">
                        <option value="">Select Column</option>
                        {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Y-Axis (Value)</label>
                    <select value={yAxis} onChange={e => setYAxis(e.target.value)} className="form-select">
                        <option value="">Select Column</option>
                        {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Aggregation</label>
                    <select value={aggregation} onChange={e => setAggregation(e.target.value)} className="form-select">
                        <option value="sum">Sum</option>
                        <option value="avg">Average</option>
                        <option value="count">Count</option>
                        <option value="min">Min</option>
                        <option value="max">Max</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="form-select">
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        onClick={generateChart}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        {loading ? "Generating..." : "Generate Chart"}
                    </button>
                </div>
            </div>

            {error && <div className="message-box message-error">{error}</div>}

            <div style={{ marginTop: "30px", height: "400px", border: "1px dashed var(--border-color)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "bar" ? (
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={xAxis} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={dataKeyY} fill="var(--color-primary)" name={`${aggregation.toUpperCase()} of ${yAxis}`} />
                            </BarChart>
                        ) : (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={xAxis} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey={dataKeyY} stroke="var(--color-tertiary)" strokeWidth={2} name={`${aggregation.toUpperCase()} of ${yAxis}`} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", flexDirection: "column" }}>
                        <span style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</span>
                        <p>Select options and click "Generate Chart" to view the result</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChartBuilder;

