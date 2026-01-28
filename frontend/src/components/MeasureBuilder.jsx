import { useState, useEffect } from "react";
import api from "../services/api";

function MeasureBuilder({ datasetId }) {
    const [measures, setMeasures] = useState([]);
    const [name, setName] = useState("");
    const [formula, setFormula] = useState("");
    const [category, setCategory] = useState("General");
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        if (!datasetId) return;
        loadData();
    }, [datasetId]);

    const loadData = async () => {
        try {
            const dsRes = await api.get(`/datasets/${datasetId}`);
            if (dsRes.data.measures) {
                setMeasures(JSON.parse(dsRes.data.measures));
            }
            const profRes = await api.get(`/datasets/${datasetId}/profile`);
            setColumns(profRes.data.columns);
        } catch (err) {
            console.error("Failed to load info", err);
        }
    };

    const fetchPreview = async (currentMeasures) => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post(`/data-modeling/${datasetId}/preview`, { measures: currentMeasures });
            setPreviewData(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to preview measures. Check your formulas.");
        } finally {
            setLoading(false);
        }
    };

    const addMeasure = () => {
        if (!name || !formula) {
            setError("Please provide both name and formula.");
            return;
        }
        if (measures.some(m => m.name === name)) {
            setError(`Measure with name '${name}' already exists.`);
            return;
        }
        if (columns.some(c => c.name === name)) {
            setError(`A raw column named '${name}' already exists.`);
            return;
        }

        const newMeasures = [...measures, { name, formula, category }];
        setMeasures(newMeasures);
        setName("");
        setFormula("");
        setError("");
    };

    const removeMeasure = (index) => {
        const newMeasures = measures.filter((_, i) => i !== index);
        setMeasures(newMeasures);
    };

    const saveMeasures = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await api.put(`/data-modeling/${datasetId}/save`, { measures: measures });
            setSuccess("Measures saved successfully!");
        } catch (err) {
            setError("Failed to save measures.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="measure-builder" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Measure & Modeling Builder</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => fetchPreview(measures)} disabled={loading} className="btn btn-secondary">
                        {loading ? "Evaluating..." : "Run Preview"}
                    </button>
                    <button onClick={saveMeasures} disabled={loading} className="btn btn-primary">
                        {loading ? "Saving..." : "Save Measures"}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                <div className="left-panel">
                    <div className="builder-panel card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                        <h4 style={{ marginBottom: "1rem" }}>Define New Measure</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Measure Name</label>
                                <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Total_Profit" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option value="General">General</option>
                                    <option value="Financial">Financial</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Operations">Operations</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Formula (e.g. Sales * 0.1  OR  SUM(Profit) / SUM(Sales))</label>
                            <textarea
                                className="form-input"
                                style={{ height: '80px', fontFamily: 'monospace' }}
                                value={formula}
                                onChange={e => setFormula(e.target.value)}
                                placeholder="Use column names directly. Supports SUM(), AVG(), COUNT(), MIN(), MAX()"
                            />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={addMeasure}>Add Measure to Definition</button>

                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>AVAILABLE RAW COLUMNS</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {columns.map(c => (
                                    <span key={c.name} className="badge" style={{ cursor: 'pointer' }} onClick={() => setFormula(f => f + c.name)}>{c.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && <div className="message-box message-error" style={{ marginBottom: '1rem' }}>{error}</div>}
                    {success && <div className="message-box message-success" style={{ marginBottom: '1rem' }}>{success}</div>}
                </div>

                <div className="right-panel">
                    <div className="measures-list card" style={{ padding: "1.5rem", height: '100%' }}>
                        <h4 style={{ marginBottom: "1rem" }}>Defined Measures ({measures.length})</h4>
                        {measures.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                                <p>No measures defined yet.</p>
                                <p style={{ fontSize: '0.8rem' }}>Start by defining a name and formula on the left.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {measures.map((m, index) => (
                                    <div key={index} className="measure-item" style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        padding: "1rem",
                                        background: 'rgba(255,255,255,0.03)',
                                        border: "1px solid var(--border-color)",
                                        borderRadius: '8px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>{m.category}</span>
                                                <strong style={{ fontSize: '1.1rem' }}>{m.name}</strong>
                                            </div>
                                            <code style={{ color: 'var(--color-primary)', display: 'block', fontSize: '0.9rem' }}>{m.formula}</code>
                                        </div>
                                        <button className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', color: '#ff4444', borderColor: 'transparent' }} onClick={() => removeMeasure(index)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="preview-section card" style={{ padding: "1.5rem", marginTop: '2rem', overflowX: 'auto' }}>
                <h4 style={{ marginBottom: "1rem" }}>Execution Preview</h4>
                {previewData ? (
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                {previewData.columns.map(col => {
                                    const isMeasure = measures.some(m => m.name === col);
                                    return (
                                        <th key={col} style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            borderBottom: '2px solid var(--border-color)',
                                            background: isMeasure ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
                                            color: isMeasure ? 'var(--color-primary)' : 'inherit'
                                        }}>
                                            {col}
                                            {isMeasure && <div style={{ fontSize: '0.6rem', fontWeight: 400 }}>Calculated</div>}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {previewData.data.slice(0, 8).map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {previewData.columns.map(col => {
                                        const isMeasure = measures.some(m => m.name === col);
                                        return (
                                            <td key={col} style={{
                                                padding: '0.8rem',
                                                background: isMeasure ? 'rgba(var(--color-primary-rgb), 0.02)' : 'transparent',
                                                fontWeight: isMeasure ? 600 : 400
                                            }}>
                                                {typeof row[col] === 'number' ? row[col].toFixed(2) : String(row[col])}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(0,0,0,0.05)', borderRadius: '12px' }}>
                        <span style={{ fontSize: '3rem' }}>🔬</span>
                        <p style={{ color: "var(--color-text-muted)", marginTop: '1rem' }}>Click "Run Preview" to evaluate and see results.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MeasureBuilder;
