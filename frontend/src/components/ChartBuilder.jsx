import { useEffect, useState } from "react";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
    AreaChart, Area, ComposedChart, FunnelChart, Funnel, LabelList
} from "recharts";

import api from "../services/api";

function ChartBuilder({ datasetId, onUpdate, initialConfig, filters: externalFilters, onInteract }) {
    const [columns, setColumns] = useState([]);
    const [xAxis, setXAxis] = useState("");
    const [yAxis, setYAxis] = useState("");
    const [subGroup, setSubGroup] = useState("");
    const [secondaryYAxis, setSecondaryYAxis] = useState("");
    const [aggregation, setAggregation] = useState("sum");
    const [chartType, setChartType] = useState("bar");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isStacked, setIsStacked] = useState(false);
    const [bins, setBins] = useState(10);
    const [useConditionalFormatting, setUseConditionalFormatting] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!datasetId) return;

        api.get(`/datasets/${datasetId}/profile`)
            .then(res => {
                setColumns(res.data.columns);
            })
            .catch(err => console.error("Failed to load columns", err));
    }, [datasetId]);

    // Hydrate state from initialConfig
    useEffect(() => {
        if (initialConfig && !initialized) {
            if (initialConfig.x_axis) setXAxis(initialConfig.x_axis);
            if (initialConfig.y_axis) setYAxis(initialConfig.y_axis);
            if (initialConfig.sub_group) setSubGroup(initialConfig.sub_group);
            if (initialConfig.secondary_y_axis) setSecondaryYAxis(initialConfig.secondary_y_axis);
            if (initialConfig.aggregation) setAggregation(initialConfig.aggregation);
            if (initialConfig.chart_type) setChartType(initialConfig.chart_type);
            if (initialConfig.is_stacked !== undefined) setIsStacked(initialConfig.is_stacked);
            if (initialConfig.bins) setBins(initialConfig.bins);
            setInitialized(true);
        }
    }, [initialConfig, initialized]);

    // Auto-generate chart when configuration, columns, or external filters are ready
    useEffect(() => {
        if (initialized && columns.length > 0 && xAxis && yAxis && !loading) {
            generateChart();
        }
    }, [initialized, columns, xAxis, yAxis, externalFilters]);

    // Sync state back to parent for saving
    useEffect(() => {
        if (onUpdate) {
            onUpdate({
                chart_type: chartType,
                x_axis: xAxis,
                y_axis: yAxis,
                sub_group: subGroup,
                secondary_y_axis: secondaryYAxis,
                aggregation: aggregation,
                is_stacked: isStacked,
                bins: bins
            });
        }
    }, [chartType, xAxis, yAxis, subGroup, secondaryYAxis, aggregation, isStacked, bins]);

    const generateChart = async () => {
        if (!xAxis || !yAxis) {
            setError("Please select both X and Y axes");
            return;
        }

        // Validation: Check if aggregation is valid for the selected Y column
        const yCol = columns.find(c => c.name === yAxis);
        const isNumeric = yCol && (yCol.dtype === 'int64' || yCol.dtype === 'float64');

        if (!isNumeric && aggregation !== 'count') {
            setError(`Cannot apply '${aggregation}' on non-numeric column '${yAxis}'. Please use 'Count'.`);
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Map UI state to backend QueryRequest
            const groupBy = [xAxis];
            if (subGroup) groupBy.push(subGroup);

            const aggregations = [{ column: yAxis, function: aggregation }];
            if (secondaryYAxis) aggregations.push({ column: secondaryYAxis, function: aggregation });

            const payload = {
                group_by: groupBy,
                aggregations: aggregations,
                sort_by: [
                    { column: `${yAxis}_${aggregation}`, order: sortOrder }
                ],
                filters: externalFilters ? Object.entries(externalFilters).map(([k, v]) => ({
                    column: k, operator: "eq", value: v
                })) : [],
                limit: 1000, // Increased limit for detailed charts
                is_histogram: chartType === "histogram",
                histogram_bins: bins
            };

            const response = await api.post(`/query/${datasetId}`, payload);
            setChartData(response.data.data);
        } catch (err) {
            setError("Failed to generate chart. Ensure your data supports the selected aggregation.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // The backend returns keys like "value_sum"
    const handleChartClick = (data) => {
        if (onInteract && data && data.activePayload && data.activePayload[0]) {
            const point = data.activePayload[0].payload;
            onInteract(xAxis, point[xAxis]);
        }
    };

    const getBarColor = (value, avg) => {
        if (!useConditionalFormatting) return "var(--color-primary)";
        return value >= avg ? "#4caf50" : "#ff5252"; // Green for above avg, Red for below
    };

    const avgValue = chartData.reduce((acc, curr) => acc + (curr[dataKeyY] || 0), 0) / (chartData.length || 1);

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
                        <option value="area">Area Chart</option>
                        <option value="pie">Pie Chart</option>
                        <option value="table">Table</option>
                        <option value="kpi">KPI Card</option>
                        <option value="histogram">Histogram</option>
                        <option value="funnel">Funnel Chart</option>
                        <option value="dual_axis">Dual Axis (Bar+Line)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">X-Axis (Group By)</label>
                    <select value={xAxis} onChange={e => setXAxis(e.target.value)} className="form-select">
                        <option value="">Select Column</option>
                        {columns.map(col => (
                            <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                    </select>
                </div>
                {["bar", "line", "area"].includes(chartType) && (
                    <div className="form-group">
                        <label className="form-label">Sub-Group (Legend)</label>
                        <select value={subGroup} onChange={e => setSubGroup(e.target.value)} className="form-select">
                            <option value="">None</option>
                            {columns.map(col => (
                                <option key={col.name} value={col.name}>{col.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">Y-Axis (Value)</label>
                    <select value={yAxis} onChange={e => setYAxis(e.target.value)} className="form-select">
                        <option value="">Select Column</option>
                        {columns.map(col => (
                            <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                    </select>
                </div>
                {chartType === "dual_axis" && (
                    <div className="form-group">
                        <label className="form-label">Secondary Y-Axis</label>
                        <select value={secondaryYAxis} onChange={e => setSecondaryYAxis(e.target.value)} className="form-select">
                            <option value="">Select Column</option>
                            {columns.map(col => (
                                <option key={col.name} value={col.name}>{col.name}</option>
                            ))}
                        </select>
                    </div>
                )}
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

                {chartType === "histogram" && (
                    <div className="form-group">
                        <label className="form-label">Bins</label>
                        <input type="number" value={bins} onChange={e => setBins(parseInt(e.target.value))} className="form-select" min="2" max="100" />
                    </div>
                )}

                {chartType === "bar" && subGroup && (
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={isStacked} onChange={e => setIsStacked(e.target.checked)} />
                            Stacked Bar
                        </label>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" checked={useConditionalFormatting} onChange={e => setUseConditionalFormatting(e.target.checked)} />
                        Conditional Colors
                    </label>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={generateChart} disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                        {loading ? "Generating..." : "Generate View"}
                    </button>
                </div>
            </div>

            {error && <div className="message-box message-error">{error}</div>}

            <div style={{ marginTop: "30px", height: "400px", border: "1px dashed var(--border-color)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === "bar" ? (
                            <BarChart data={chartData} onClick={handleChartClick}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={xAxis} />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                <Legend />
                                <Bar
                                    dataKey={dataKeyY}
                                    name={`${aggregation.toUpperCase()} of ${yAxis}`}
                                >
                                    {chartData.map((entry, index) => (
                                        <cell key={`cell-${index}`} fill={getBarColor(entry[dataKeyY], avgValue)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        ) : (
                            <LineChart data={chartData} onClick={handleChartClick}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={xAxis} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey={dataKeyY} stroke="var(--color-tertiary)" strokeWidth={2} name={`${aggregation.toUpperCase()} of ${yAxis}`} activeDot={{ r: 8, onClick: (e, payload) => handleChartClick({ activePayload: [payload] }) }} />
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

