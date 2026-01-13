import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on load
        const token = localStorage.getItem("token");
        if (token) {
            // Ideally verify token with backend here
            api.get("/auth/me")
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("token");
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const formData = new FormData(); // FastAPI OAuth2PasswordRequestForm expects params or form data usually, but our backend uses Pydantic schema
        // Check backend: routers/auth.py uses UserLogin schema (JSON body)

        const response = await api.post("/auth/login", { email, password });
        const { access_token } = response.data;

        localStorage.setItem("token", access_token);

        // Fetch user details immediately
        const userRes = await api.get("/auth/me");
        setUser(userRes.data);
        return true;
    };

    const register = async (email, username, password) => {
        await api.post("/auth/register", { email, username, password });
        return login(email, password); // Auto login after register
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
