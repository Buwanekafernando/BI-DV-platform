import { useEffect, useState } from "react";
import api from "../services/api";

function DatasetProfile({ datasetId }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!datasetId) return;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/datasets/${datasetId}/profile`);
                setProfile(response.data);
            } catch (err) {
                setError("Failed to load dataset profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [datasetId]);

    if (!datasetId) return null;
    if (loading) return <p>Loading dataset profile...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!profile) return null;

    return (
        <div className="dataset-profile">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <span style={{ marginRight: '20px', fontSize: '1.1rem' }}><strong>Total Rows:</strong> {profile.total_rows}</span>
                    <span style={{ fontSize: '1.1rem' }}><strong>Total Columns:</strong> {profile.total_columns}</span>
                </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Column Name</th>
                            <th>Data Type</th>
                            <th>Missing Values</th>
                            <th>Missing %</th>
                            <th>Unique Values</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profile.columns.map((col, index) => (
                            <tr key={index}>
                                <td>{col.name}</td>
                                <td><span style={{
                                    padding: '2px 6px',
                                    background: 'var(--color-background-surface)',
                                    fontSize: '0.85rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)'
                                }}>{col.dtype}</span></td>
                                <td style={{ color: col.missing_count > 0 ? 'var(--color-error)' : 'inherit' }}>
                                    {col.missing_count}
                                </td>
                                <td>{col.missing_percentage.toFixed(2)}%</td>
                                <td>{col.unique_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DatasetProfile;
