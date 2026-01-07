import { useState } from "react";
import api from "../services/api";

function ShareDashboard({ dashboardId }) {
  const [userId, setUserId] = useState("");

  const share = async () => {
    await api.post("/share/dashboard", {
      dashboard_id: dashboardId,
      user_id: userId,
      permission: "view"
    });
    alert("Dashboard shared");
  };

  return (
    <div>
      <input
        placeholder="User ID"
        onChange={e => setUserId(e.target.value)}
      />
      <button onClick={share}>Share</button>
    </div>
  );
}

export default ShareDashboard;
