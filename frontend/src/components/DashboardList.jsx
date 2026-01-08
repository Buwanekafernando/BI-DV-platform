import { useEffect, useState } from "react";
import api from "../services/api";
import GridDashboard from "./GridDashboard";

function DashboardList({ onSelect, datasetId }) {
    const [dashboards, setDashboards] = useState([]);
    const [filters, setFilters] = useState({});
    const [charts, setCharts] = useState([]);

    useEffect(() => {
        api.get("/dashboard/dashboards").then(res => setDashboards(res.data));
    }, []);

    const loadDashboard = async (dashboardId) => {
        const res = await api.get(`/dashboard/dashboards/${dashboardId}`);
        onSelect(dashboardId, res.data);
    };

    return (
        <div>
            <h3>Saved Dashboards</h3>
            <ul>
                {dashboards.map(d => (
                    <li key={d.id}>
                        <button onClick={() => loadDashboard(d.id)}>
                            {d.name}
                        </button>
                    </li>
                ))}
            </ul>
            {datasetId && <GridDashboard datasetId={datasetId} />}
        </div>
    );
}

export default DashboardList;
