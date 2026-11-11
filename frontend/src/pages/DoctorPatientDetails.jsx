
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/dashboard.css";
import "../styles/DoctorPatientDetails.css";

function DoctorPatientDetails() {
    const { patientId, appointmentId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const response = await api.get(
                    `prescriptions/doctor-patient/${patientId}/${appointmentId}/`
                );

                setData(response.data);
            } catch (err) {
                console.error("Patient details error:", err);

                setError(
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Unable to load patient details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPatientDetails();
    }, [patientId, appointmentId]);

    const handleLogout = () => {
        localStorage.removeItem("doctorAccessToken");
        localStorage.removeItem("doctorRefreshToken");
        navigate("/doctor-login");
    };

    if (loading) {
        return (
            <div className="patient-dashboard">
                <main className="dashboard-content">
                    Loading patient details...
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="patient-dashboard">
                <main className="dashboard-content">
                    <p>{error}</p>
                    <button onClick={() => navigate("/doctor-dashboard")}>
                        Back to Doctor Dashboard
                    </button>
                </main>
            </div>
        );
    }

    if (!data) return null;

    const { patient, appointment } = data;

    
const actions = [
    ...(!data.is_first_visit
        ? [
            {
                icon: "📋",
                title: "Medical History",
                description:
                    "Review this patient's previous visits and medical records.",
                link: `/doctor/medical-history/${patientId}`,
                button: "View medical history",
            },
        ]
        : []),

    {
        icon: "💊",
        title: "Prescriptions",
        description: data.is_first_visit
            ? "Create the patient's first prescription."
            : "Review previous prescriptions and create a new prescription.",
        link: `/doctor/create-prescription/${patientId}/${appointmentId}`,
        button: "Create prescription",
    },
];


    return (
        <div className="patient-dashboard">

            {/* Doctor Portal Navbar */}
            <header className="dashboard-navbar">
                <Link to="/doctor-dashboard" className="dashboard-brand">
                    <span className="dashboard-brand-icon">+</span>
                    <span>HealthsApp</span>
                </Link>

                <div className="dashboard-nav-right">
                    <span className="dashboard-portal-label">
                        Doctor Portal
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

                {/* Patient Information */}
                
{/* Patient Profile */}



<section className="dashboard-welcome doctor-patient-profile">

    {/* First row: Patient name and icon */}
    <div className="doctor-profile-main">
        <p className="dashboard-eyebrow">
            PATIENT PROFILE
        </p>

        <h1>{patient.name}</h1>
    </div>

    <div className="dashboard-welcome-icon">
        👤
    </div>

    {/* Second row: Patient details */}
    <div className="doctor-patient-info-line">

        <div>
            <span>Patient ID:
            <strong>{patient.patient_id}</strong>
            </span>
        </div>
        <div>
            <span>Age: 
            <strong>{patient.age ?? "Not provided"}</strong>
            </span>
        </div>

        <div>
            <span>Gender:
            <strong>{patient.gender || "Not provided"}</strong>
            </span>
        </div>

        <div>
            <span>Phone:
            <strong> {patient.phone_number}</strong>
            </span>
        </div>

        <div>
            <span>Address:
            <strong> {patient.address}</strong>
            </span>
        </div>

    </div>

    {/* Third row: Appointment details */}
    <div className="doctor-profile-appointment">

        <div className="doctor-profile-appointment-heading">
            <h3>Current Appointment</h3>
        </div>

        <div className="doctor-appointment-details">

            <div className="doctor-appointment-row">
                <span>Booking Code: 
                <strong> {appointment.booking_code}</strong>
                </span>
            </div>

            <div className="doctor-appointment-row">
                <span>Appointment Date: 
                <strong> {appointment.appointment_date}</strong>
                </span>
            </div>

            <div className="doctor-appointment-row">
                <span>Time Slot:
                <strong> {appointment.time_slot}</strong>
                </span>
            </div>

            <div className="doctor-appointment-row">
                <span>Symptoms:
                <strong> {appointment.symptoms || "Not provided"}</strong>
                </span>
            </div>

            <div className="doctor-appointment-row">
                <span>Status:
                <strong> {appointment.status}</strong>
                </span>
            </div>

        </div>
    </div>

</section>



                {/* Current Appointment */}
                {/* Current Appointment */}


                {/* Medical History and Prescription Cards */}
                <section className="dashboard-section">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Patient Healthcare</h2>
                            <p>
                                Access this patient's medical records and prescriptions.
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
                    <span>HealthsApp Doctor Portal</span>
                    <span>Patient care, organized.</span>
                </footer>

            </main>
        </div>
    );
}

export default DoctorPatientDetails;
