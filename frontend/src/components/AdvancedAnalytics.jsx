import { useState } from "react";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

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
  }; {/* Render the forecast result using Recharts */}

  return (
    <div>
      <h3>Advanced Analytics</h3>
      <button onClick={runForecast}>Run Forecast</button>

      {result && (
        <LineChart width={600} height={300} data={Object.entries(result.forecast)}>
          <XAxis />
          <YAxis />
          <Tooltip />
          <Line dataKey="1" />
        </LineChart>
      )}
    </div>
  );
}

export default AdvancedAnalytics;
