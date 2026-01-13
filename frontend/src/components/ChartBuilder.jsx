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
        <div style={{ marginTop: "40px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h3>Chart Builder</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                <div>
                    <label>Chart Type</label>
                    <select value={chartType} onChange={e => setChartType(e.target.value)} style={{ width: "100%", padding: "5px" }}>
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                    </select>
                </div>
                <div>
                    <label>X-Axis (Group By)</label>
                    <select value={xAxis} onChange={e => setXAxis(e.target.value)} style={{ width: "100%", padding: "5px" }}>
                        <option value="">Select Column</option>
                        {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Y-Axis (Value)</label>
                    <select value={yAxis} onChange={e => setYAxis(e.target.value)} style={{ width: "100%", padding: "5px" }}>
                        <option value="">Select Column</option>
                        {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Aggregation</label>
                    <select value={aggregation} onChange={e => setAggregation(e.target.value)} style={{ width: "100%", padding: "5px" }}>
                        <option value="sum">Sum</option>
                        <option value="avg">Average</option>
                        <option value="count">Count</option>
                        <option value="min">Min</option>
                        <option value="max">Max</option>
                    </select>
                </div>
                <div>
                    <label>Sort Order</label>
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ width: "100%", padding: "5px" }}>
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            <button onClick={generateChart} disabled={loading} style={{ padding: "10px 20px", cursor: "pointer" }}>
                {loading ? "Generating..." : "Generate Chart"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ marginTop: "30px", height: "400px" }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "bar" ? (
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={xAxis} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey={dataKeyY} fill="#8884d8" name={`${aggregation.toUpperCase()} of ${yAxis}`} />
                            </BarChart>
                        ) : (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={xAxis} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey={dataKeyY} stroke="#82ca9d" name={`${aggregation.toUpperCase()} of ${yAxis}`} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                ) : (
                    <p style={{ textAlign: "center", color: "#888" }}>Generate a chart to view the result</p>
                )}
            </div>
        </div>
    );
}

export default ChartBuilder;

