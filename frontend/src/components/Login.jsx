import { useState } from "react";
import api from "../services/api";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await api.post("/auth/login", { email, password });
            localStorage.setItem("token", response.data.access_token);
            api.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
            onLogin();
            setMessage("Login successful!");
        } catch (error) {
            setMessage(error.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc", maxWidth: "300px", margin: "auto" }}>
            <h3>Login</h3>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />
            <button onClick={handleLogin} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Login;