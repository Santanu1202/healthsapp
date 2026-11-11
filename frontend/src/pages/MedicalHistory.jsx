
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/dashboard.css";

function MedicalHistory() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMedicalHistory = async () => {
            try {
                const response = await api.get(
                    "prescriptions/medical-history/"
                );

                setPrescriptions(response.data.prescriptions || []);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load medical history. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMedicalHistory();
    }, []);

    return (
        <div className="patient-dashboard">
            <header className="dashboard-navbar">
                <Link to="/dashboard" className="dashboard-brand">
                    <span className="dashboard-brand-icon">+</span>
                    <span>HealthsApp</span>
                </Link>

                <Link to="/dashboard" className="patient-action-link">
                    Back to Dashboard
                </Link>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-section">
                    <h1>Medical History</h1>
                    <p>All your previous prescriptions from different doctors.</p>

                    {loading && <p>Loading medical history...</p>}

                    {error && <p role="alert">{error}</p>}

                    {!loading && !error && prescriptions.length === 0 && (
                        <p>No medical history available yet.</p>
                    )}

                    {!loading && prescriptions.map((prescription) => (
                        <article
                            className="patient-action-card"
                            key={prescription.id}
                        >
                            <h3>{prescription.doctor_name}</h3>

                            <p>
                                <strong>Degree:</strong>{" "}
                                {prescription.doctor_degree}
                            </p>

                            <p>
                                <strong>Booking ID:</strong>{" "}
                                {prescription.booking_code}
                            </p>

                            <p>
                                <strong>Date:</strong>{" "}
                                {new Date(
                                    prescription.created_at
                                ).toLocaleDateString()}
                            </p>

                            <p>
                                <strong>Diagnosis:</strong>{" "}
                                {prescription.diagnosis}
                            </p>

                            <p><strong>Medicines:</strong></p>

                            <p style={{ whiteSpace: "pre-wrap" }}>
                                {prescription.medicines}
                            </p>

                            <p>
                                <strong>Instructions:</strong>{" "}
                                {prescription.instructions || "—"}
                            </p>

                            <p>
                                <strong>Tests advised:</strong>{" "}
                                {prescription.tests_advised || "—"}
                            </p>

                            <p>
                                <strong>Follow-up date:</strong>{" "}
                                {prescription.follow_up_date || "—"}
                            </p>
                        </article>
                    ))}
                </section>
            </main>
        </div>
    );
}

export default MedicalHistory;
