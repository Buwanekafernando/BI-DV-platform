import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import boclogo from '../assets/boclogo.png';

function Login() {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, username, password);
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "linear-gradient(135deg, var(--color-background-surface) 0%, #e0e0e0 100%)"
        }}>
            <div className="card" style={{ width: "400px", padding: "40px", boxShadow: "var(--shadow-lg)" }}>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <img src={boclogo} alt="BOC Logo" style={{ height: "60px", marginBottom: "15px" }} />
                    <h2 style={{ color: "var(--color-secondary)" }}>{isLogin ? "Welcome Back" : "Create Account"}</h2>
                    <p style={{ color: "var(--color-text-muted)" }}>BOC Business Intelligence Platform</p>
                </div>

                <div style={{ display: "flex", marginBottom: "20px", borderBottom: "1px solid var(--border-color)" }}>
                    <button
                        onClick={() => setIsLogin(true)}
                        style={{
                            flex: 1,
                            padding: "10px",
                            background: "none",
                            border: "none",
                            borderBottom: isLogin ? "3px solid var(--color-primary)" : "3px solid transparent",
                            fontWeight: isLogin ? "600" : "400",
                            color: isLogin ? "var(--color-secondary)" : "var(--color-text-muted)"
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        style={{
                            flex: 1,
                            padding: "10px",
                            background: "none",
                            border: "none",
                            borderBottom: !isLogin ? "3px solid var(--color-primary)" : "3px solid transparent",
                            fontWeight: !isLogin ? "600" : "400",
                            color: !isLogin ? "var(--color-secondary)" : "var(--color-text-muted)"
                        }}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="message-box message-error" style={{ marginBottom: "20px" }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "10px" }}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: "20px", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                &copy; 2026 Bank of Ceylon. All rights reserved.
            </div>
        </div>
    );
}

export default Login;