import api from "../services/api";
import { exportAsImage } from "../utils/exportImage";

function ExportButtons({ dashboardId }) {
  const exportPDF = () => {
    window.open(
      `${api.defaults.baseURL}/export/dashboard/${dashboardId}/pdf`,
      "_blank"
    );
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={exportPDF} className="btn btn-secondary">📄 Export PDF</button>
      <button onClick={() => exportAsImage("dashboard-canvas")} className="btn btn-secondary">
        🖼 Export Image
      </button>
    </div>
  );
}

export default ExportButtons;
