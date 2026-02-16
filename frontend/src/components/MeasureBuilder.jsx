import { useState, useEffect } from "react";
import api from "../services/api";

function MeasureBuilder({ datasetId }) {
    const [measures, setMeasures] = useState([]);
    const [name, setName] = useState("");
    const [formula, setFormula] = useState("");
    const [category, setCategory] = useState("General");
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [infoLoading, setInfoLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        if (!datasetId) return;
        loadData();
    }, [datasetId]);

    const loadData = async () => {
        setInfoLoading(true);
        setError("");
        try {
            const dsRes = await api.get(`/datasets/${datasetId}`);
            if (dsRes.data.measures) {
                setMeasures(JSON.parse(dsRes.data.measures));
            }
            const profRes = await api.get(`/datasets/${datasetId}/profile`);
            setColumns(profRes.data.columns || []);
        } catch (err) {
            console.error("Failed to load info", err);
            setError("Failed to load dataset details. The file might be missing or corrupted.");
        } finally {
            setInfoLoading(false);
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
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 className="header-title" style={{ textTransform: 'none', color: 'var(--color-secondary-maroon)' }}>Measure & Modeling Builder</h1>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button onClick={() => fetchPreview(measures)} disabled={loading} className="btn btn-secondary">
                        {loading ? "Evaluating..." : "Run Preview"}
                    </button>
                    <button onClick={saveMeasures} disabled={loading} className="btn btn-primary">
                        {loading ? "Saving..." : "Save Measures"}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="left-panel">
                    <div className="card">
                        <h3>Define New Measure</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)", marginBottom: 'var(--spacing-md)' }}>
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
                        <div className="form-group">
                            <label className="form-label">Formula (e.g. Sales * 0.1  OR  SUM(Profit) / SUM(Sales))</label>
                            <textarea
                                className="form-input"
                                style={{ height: '80px', fontFamily: 'monospace' }}
                                value={formula}
                                onChange={e => setFormula(e.target.value)}
                                placeholder="Use column names directly. Supports SUM(), AVG(), COUNT(), MIN(), MAX()"
                            />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--spacing-md)' }} onClick={addMeasure}>Add Measure to Definition</button>

                        <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: '#F3F4F6', borderRadius: 'var(--radius-md)' }}>
                            <p className="form-label" style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-sm)' }}>AVAILABLE RAW COLUMNS</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                {infoLoading ? (
                                    <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Loading columns...</span>
                                ) : columns.length > 0 ? (
                                    columns.map(c => (
                                        <span key={c.name} className="badge" style={{ cursor: 'pointer' }} onClick={() => setFormula(f => f + c.name)}>{c.name}</span>
                                    ))
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No columns available.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && <div className="message-box message-error">{error}</div>}
                    {success && <div className="message-box message-success">{success}</div>}
                </div>

                <div className="right-panel">
                    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <h3>Defined Measures ({measures.length})</h3>
                        {measures.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <p>No measures defined yet.</p>
                                <p style={{ fontSize: '0.85rem' }}>Start by defining a name and formula on the left.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', overflowY: 'auto', flex: 1 }}>
                                {measures.map((m, index) => (
                                    <div key={index} style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        padding: "var(--spacing-md)",
                                        background: 'var(--color-background-soft)',
                                        border: "1px solid var(--color-border-light)",
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                                <span className="badge badge-primary">{m.category}</span>
                                                <strong style={{ fontSize: '1rem', color: 'var(--color-secondary-maroon)' }}>{m.name}</strong>
                                            </div>
                                            <code style={{ color: 'var(--color-tertiary-blue)', display: 'block', fontSize: '0.85rem' }}>{m.formula}</code>
                                        </div>
                                        <button className="btn" style={{ padding: '0.25rem 0.5rem', color: 'var(--color-secondary-maroon)', border: 'none', background: 'transparent' }} onClick={() => removeMeasure(index)}>
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
                <h3>Execution Preview</h3>
                {previewData ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {previewData.columns.map(col => {
                                        const isMeasure = measures.some(m => m.name === col);
                                        return (
                                            <th key={col} style={{
                                                background: isMeasure ? 'rgba(0, 79, 113, 0.05)' : 'transparent',
                                                color: isMeasure ? 'var(--color-tertiary-blue)' : 'inherit'
                                            }}>
                                                {col}
                                                {isMeasure && <div style={{ fontSize: '0.6rem', fontWeight: 600 }}>Calculated</div>}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.data.slice(0, 8).map((row, i) => (
                                    <tr key={i}>
                                        {previewData.columns.map(col => {
                                            const isMeasure = measures.some(m => m.name === col);
                                            return (
                                                <td key={col} style={{
                                                    background: isMeasure ? 'rgba(0, 79, 113, 0.02)' : 'transparent',
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
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--color-background-soft)', borderRadius: 'var(--radius-lg)' }}>
                        <span style={{ fontSize: '3rem' }}>🔬</span>
                        <p style={{ color: "var(--color-text-muted)", marginTop: '1rem' }}>Click "Run Preview" to evaluate and see results.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MeasureBuilder;
