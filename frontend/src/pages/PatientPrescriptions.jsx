
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/dashboard.css";
import generatePrescriptionPDF from "../utils/generatePrescriptionPDF";

function PatientPrescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await api.get("prescriptions/patient-today/");
                setPrescriptions(response.data.prescriptions || []);
            } catch (err) {
                setError(
                    err.response?.data?.detail ||
                    "Unable to load prescriptions. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPrescriptions();
    }, []);

    if (loading) {
        return <main className="dashboard-content">Loading prescriptions...</main>;
    }

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
                    <h1>My Prescriptions</h1>
                    <p>Prescriptions for your appointments today.</p>

                    {error && <p role="alert">{error}</p>}

                    {!error && prescriptions.length === 0 && (
                        <p>Prescription not available yet.</p>
                    )}

                    {prescriptions.map((prescription) => (
                        <article
                            className="patient-action-card"
                            key={prescription.id}
                        >
                            <h3>{prescription.doctor_name}</h3>
                            <p><strong>Booking ID:</strong> {prescription.booking_code}</p>
                            <p><strong>Date:</strong> {prescription.created_at
                                ? new Date(prescription.created_at).toLocaleDateString()
                                : "—"}</p>
                            <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                            <p><strong>Medicines:</strong></p>
                            <p style={{ whiteSpace: "pre-wrap" }}>
                                {prescription.medicines}
                            </p>
                            <p><strong>Instructions:</strong> {prescription.instructions || "—"}</p>
                            <p><strong>Tests advised:</strong> {prescription.tests_advised || "—"}</p>
                            <p><strong>Follow-up:</strong> {prescription.follow_up_date || "—"}</p>
                        </article>
                    ))}
                    <button
    type="button"
    onClick={() => generatePrescriptionPDF(prescription)}
    className="patient-action-link"
>
    Download Prescription PDF ↓
</button>
                </section>
            </main>
        </div>
    );
}

export default PatientPrescriptions;
