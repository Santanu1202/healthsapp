
import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post(
    "accounts/admin-login/",
    {
        username: username.trim(),
        password,
    },
    {
        headers: {
            Authorization: "",
        },
    }
);

            // Temporary: credentials are verified by the backend.
            // We'll add a persistent admin session and route protection next.
            // Save admin authentication tokens
localStorage.setItem("adminAccessToken", response.data.access);
localStorage.setItem("adminRefreshToken", response.data.refresh);
localStorage.setItem("adminUsername", response.data.username);

alert(response.data.message);
navigate("/admin-dashboard");
        }  catch (err) {
    console.error("Admin login error:", err.response?.data || err);
    setError(
        JSON.stringify(
            err.response?.data || {
                message: "Unable to connect to the server."
            }
        )
    );
}
         finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1>HealthsApp</h1>
                    <p>Administrator Login</p>
                </div>

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Admin Username"
                        autoComplete="username"
                        style={styles.input}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        style={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p style={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Admin Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    header: {
        textAlign: "center",
        marginBottom: "20px",
    },
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#F3F8F7",
    },
    card: {
        width: "420px",
        maxWidth: "90%",
        padding: "28px",
        textAlign: "center",
        background: "#FFFFFF",
        borderRadius: "20px",
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.08)",
    },
    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        marginTop: "15px",
        border: "1px solid #CBD5D1",
        borderRadius: "10px",
        fontSize: "16px",
    },
    button: {
        width: "100%",
        padding: "12px",
        marginTop: "20px",
        border: "none",
        borderRadius: "10px",
        fontSize: "16px",
        background: "#087D73",
        color: "#FFFFFF",
        cursor: "pointer",
    },
    error: {
        color: "#C62828",
        marginTop: "12px",
    },
};

export default AdminLogin;
