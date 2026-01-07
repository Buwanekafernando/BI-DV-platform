import { useEffect, useState } from "react";
import api from "../services/api";
import GridDashboard from "./GridDashboard";

function DashboardList({ onSelect }) {
    const [dashboards, setDashboards] = useState([]);



    useEffect(() => {
        api.get("/dashboards").then(res => setDashboards(res.data));
    }, []);

    const loadDashboard = async (dashboardId) => {
        const res = await api.get(`/dashboards/${dashboardId}`);
        setFilters(res.data.filters);
        setCharts(res.data.charts);
    };

    return (
        <div>
            <h3>Saved Dashboards</h3>
            <ul>
                {dashboards.map(d => (
                    <li key={d.id}>
                        <button onClick={() => onSelect(d.id)}>
                            {d.name}
                        </button>
                    </li>
                ))}
                <button onClick={loadDashboard}>Load Dashboard</button>
                
            </ul>
            <GridDashboard datasetId={datasetId} />

        </div>
    );
}

export default DashboardList;
