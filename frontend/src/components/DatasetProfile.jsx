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
        <div style={{ marginTop: "30px", border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
            <h3>Dataset Profile</h3>
            <p><strong>Total Rows:</strong> {profile.total_rows} | <strong>Total Columns:</strong> {profile.total_columns}</p>

            <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse", borderColor: "#ddd" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
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
                            <td>{col.dtype}</td>
                            <td>{col.missing_count}</td>
                            <td>{col.missing_percentage.toFixed(2)}%</td>
                            <td>{col.unique_count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DatasetProfile;
