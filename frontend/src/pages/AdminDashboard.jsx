import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
    total_bookings: 0,
    total_patients: 0,
    total_doctors: 0,
    total_departments: 0,
});

const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchDashboardStats = async () => {
        try {
            const response = await api.get("admin-dashboard-stats/");
            setStats(response.data);
        } catch (error) {
            console.error("Failed to load dashboard statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchDashboardStats();
}, []);

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div>
                    <h1 style={styles.logo}>HealthsApp</h1>
                    <p style={styles.subtitle}>Administrator Dashboard</p>
                </div>

                
                
<button
    style={styles.logoutButton}
    onClick={() => {
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("adminUsername");

        navigate("/admin-login", { replace: true });
    }}
>
    Logout
</button>

            </header>

            <main style={styles.main}>
                <h2 style={styles.heading}>Dashboard Overview</h2>
                <p style={styles.description}>
                    Manage hospital appointments, patients, and doctors.
                </p>

                <section style={styles.grid}>
    <DashboardCard
        title="Total Bookings"
        value={loading ? "..." : stats.total_bookings}
        icon="📅"
    />

    <DashboardCard
        title="Registered Patients"
        value={loading ? "..." : stats.total_patients}
        icon="👥"
    />

    <DashboardCard
        title="Registered Doctors"
        value={loading ? "..." : stats.total_doctors}
        icon="🩺"
    />

    <DashboardCard
        title="Departments"
        value={loading ? "..." : stats.total_departments}
        icon="🏥"
    />
</section>

                <h2 style={styles.heading}>Quick Actions</h2>

                <section style={styles.actions}>
                    <button
                        style={styles.actionButton}
                        onClick={() => navigate("/register-doctor")}
                    >
                        + Register Doctor
                    </button>

                    <button
                        style={styles.actionButton}
                        onClick={() => navigate("/admin-patients")}
                    >
                        Search Patient by ID
                    </button>
                </section>

                <section style={styles.panel}>
                    <h3>Recent Appointments</h3>
                    <p style={styles.description}>
                        Appointment records will appear here after we connect
                        the dashboard to your backend.
                    </p>
                </section>
            </main>
        </div>
    );
}
function DashboardCard({ title, value, icon }) {
    return (
        <div style={styles.card}>
            <span style={styles.icon}>{icon}</span>
            <h3 style={styles.cardValue}>{value}</h3>
            <p style={styles.cardTitle}>{title}</p>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#F3F8F7",
        fontFamily: "Arial, sans-serif",
        color: "#164E49",
    },
    header: {
        background: "#FFFFFF",
        padding: "20px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        borderBottom: "1px solid #D5E7E3",
    },
    logo: {
        margin: 0,
        color: "#087D73",
        fontSize: "28px",
    },
    subtitle: {
        margin: "5px 0 0",
        color: "#53716C",
    },
    logoutButton: {
        padding: "10px 18px",
        border: "1px solid #087D73",
        borderRadius: "8px",
        background: "#FFFFFF",
        color: "#087D73",
        cursor: "pointer",
    },
    main: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px 5%",
    },
    heading: {
        marginBottom: "8px",
        fontSize: "22px",
    },
    description: {
        color: "#647B76",
        lineHeight: 1.6,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "18px",
        margin: "25px 0 35px",
    },
    card: {
        background: "#FFFFFF",
        padding: "22px",
        borderRadius: "14px",
        border: "1px solid #E0ECE9",
        boxShadow: "0 3px 12px rgba(20, 70, 60, 0.04)",
    },
    icon: {
        fontSize: "26px",
    },
    cardValue: {
        fontSize: "30px",
        margin: "14px 0 5px",
    },
    cardTitle: {
        margin: 0,
        color: "#53716C",
    },
    actions: {
        display: "flex",
        flexWrap: "wrap",
        gap: "14px",
        margin: "20px 0 30px",
    },
    actionButton: {
        padding: "13px 20px",
        border: "none",
        borderRadius: "9px",
        background: "#087D73",
        color: "#FFFFFF",
        cursor: "pointer",
        fontSize: "15px",
    },
    panel: {
        background: "#FFFFFF",
        padding: "22px",
        borderRadius: "14px",
        border: "1px solid #E0ECE9",
    },
};

export default AdminDashboard;
