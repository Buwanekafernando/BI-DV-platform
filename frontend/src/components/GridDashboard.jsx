import { useState } from "react";
import GridLayout from "react-grid-layout";
import GridChart from "./GridChart";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

function GridDashboard({ datasetId }) {
  const [layout, setLayout] = useState([]);
  const [charts, setCharts] = useState([]);

  const addChart = () => {
    const id = Date.now().toString();
    setCharts([...charts, { id }]);
    setLayout([
      ...layout,
      { i: id, x: 0, y: Infinity, w: 6, h: 6 }
    ]);
  };

  return (
    <div>
      <button onClick={addChart}>➕ Add Chart</button>

      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={setLayout}
        draggableHandle=".chart-header"
      >
        {charts.map(chart => (
          <div key={chart.id} data-grid={layout.find(l => l.i === chart.id)}>
            <GridChart datasetId={datasetId} />
          </div>
        ))}
      </GridLayout>
    </div>
  );
}

export default GridDashboard;
