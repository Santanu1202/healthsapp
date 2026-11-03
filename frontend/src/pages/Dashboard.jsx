
import { Link, useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/");
    };

    const actions = [
        {
            icon: "📅",
            title: "Book Appointment",
            description:
                "Choose a department, doctor, date and available time slot.",
            link: "/book",
            button: "Book an appointment",
        },
        {
            icon: "🗓️",
            title: "My Appointments",
            description:
                "View your bookings and check appointment status.",
            link: "/patient-appointments",
            button: "View appointments",
        },
        {
            icon: "📋",
            title: "Medical History",
            description:
                "Review your previous visits and medical records.",
            link: "/medical-history",
            button: "View medical history",
        },
        {
            icon: "💊",
            title: "My Prescriptions",
            description:
                "View your prescriptions and download available PDFs.",
            link: "/prescriptions",
            button: "View prescriptions",
        },
    ];

    return (
        <div className="patient-dashboard">
            <header className="dashboard-navbar">
                <Link to="/dashboard" className="dashboard-brand">
                    <span className="dashboard-brand-icon">+</span>
                    <span>HealthsApp</span>
                </Link>

                <div className="dashboard-nav-right">
                    <span className="dashboard-portal-label">
                        Patient Portal
                    </span>

                    <button
                        className="dashboard-logout"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-welcome">
                    <div>
                        <p className="dashboard-eyebrow">
                            PATIENT PORTAL
                        </p>

                        <h1>Welcome to HealthsApp</h1>

                        <p className="dashboard-welcome-text">
                            Manage your appointments, medical history
                            and prescriptions in one place.
                        </p>
                    </div>

                    <div className="dashboard-welcome-icon">
                        🩺
                    </div>
                </section>
                
{/* <section className="appointment-tracking-card">
    <div className="tracking-icon">🔎</div>

    <div className="tracking-content">
        <h2>Track Your Appointment</h2>
        <p>
            Check your booking status and appointment details
            using your Booking ID.
        </p>
    </div>

    <Link
        to="/patient-appointments"
        className="tracking-button"
    >
        Track Appointment →
    </Link>
</section> */}

                <section className="dashboard-section">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Your Healthcare</h2>
                            <p>
                                Choose an option to get started.
                            </p>
                        </div>
                    </div>

                    <div className="patient-action-grid">
                        {actions.map((action) => (
                            <article
                                className="patient-action-card"
                                key={action.title}
                            >
                                <div className="patient-action-icon">
                                    {action.icon}
                                </div>

                                <h3>{action.title}</h3>

                                <p>{action.description}</p>

                                <Link
                                    className="patient-action-link"
                                    to={action.link}
                                >
                                    {action.button}
                                    <span aria-hidden="true"> →</span>
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                <footer className="dashboard-footer">
                    <span>HealthsApp Patient Portal</span>
                    <span>Your healthcare, organized.</span>
                </footer>
            </main>
        </div>
    );
}

export default Dashboard;
