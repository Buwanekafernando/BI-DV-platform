import { useState } from "react";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

function AdvancedAnalytics({ datasetId }) {
  const [result, setResult] = useState(null);

  const runForecast = async () => {
    const res = await api.post("/analytics/forecast", {
      dataset_id: datasetId,
      date_column: "date",
      value_column: "amount",
      periods: 6
    });
    setResult(res.data);
  }; {/* Render the forecast result using Recharts */ }

  return (
    <div className="advanced-analytics">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ marginBottom: '16px', color: 'var(--color-text-muted)' }}>
          Run advanced forecasting models on your time-series data.
        </p>
        <button onClick={runForecast} className="btn btn-accent">
          ✨ Run Forecast
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ marginBottom: '16px', color: 'var(--color-tertiary)' }}>Forecast Results</h4>
          <div style={{ width: '100%', height: '300px', background: 'var(--color-background-surface)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Object.entries(result.forecast).map(([k, v]) => ({ date: k, value: v }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedAnalytics;
