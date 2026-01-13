import { useState } from "react";
import api from "../services/api";

function DatasetUpload({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a CSV file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await api.post("/datasets/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage("Upload successful!");
            onUploadSuccess(response.data.dataset_id);
        } catch (error) {
            setMessage(
                error.response?.data?.detail || "Upload failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dataset-upload">
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-tertiary)' }}>Upload CSV Dataset</h3>

            <div className="file-upload-zone">
                <input
                    type="file"
                    accept=".csv"
                    id="file-upload"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }} // Hide default input
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block', width: '100%' }}>
                    {file ? (
                        <div style={{ fontWeight: '600', color: 'var(--color-tertiary)' }}>
                            📄 {file.name}
                        </div>
                    ) : (
                        <div>
                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>☁️</span>
                            <span style={{ color: 'var(--color-text-muted)' }}>Click to select a CSV file</span>
                        </div>
                    )}
                </label>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    {loading ? "Uploading..." : "Upload Dataset"}
                </button>
            </div>

            {message && (
                <div className={`message-box ${message.includes("success") ? "message-success" : "message-error"}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default DatasetUpload;
