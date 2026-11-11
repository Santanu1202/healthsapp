
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/dashboard.css";
import "../styles/DoctorCreatePrescription.css";

function DoctorCreatePrescription() {
    const { patientId, appointmentId } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        diagnosis: "",
        medicines: "",
        instructions: "",
        tests_advised: "",
        follow_up_date: "",
    });

    // Load patient and appointment information
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(
    `prescriptions/doctor-patient/${patientId}/${appointmentId}/`
);

setAppointment(response.data);
            } catch (err) {
                console.error(err);
                setError("Unable to load appointment details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [appointmentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const response = await api.post(
                `prescriptions/create/${appointmentId}/`,
                formData
            );

            setSuccess(response.data.message);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.error ||
                "Unable to save prescription. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main className="dashboard-content">
                Loading appointment details...
            </main>
        );
    }

    if (error && !appointment) {
        return (
            <main className="dashboard-content">
                <p>{error}</p>
                <button onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </main>
        );
    }

    const patient = appointment?.patient;
    const appointmentDetails = appointment?.appointment;

    return (
        <div className="doctor-prescription-page">

            <header className="dashboard-navbar">
                <div className="dashboard-brand">
                    <span className="dashboard-brand-icon">+</span>
                    <span>HealthsApp</span>
                </div>

                <div className="dashboard-nav-right">
                    <span className="dashboard-portal-label">
                        Doctor Portal
                    </span>

                    <button
                        className="dashboard-logout"
                        onClick={() => navigate("/doctor-dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="dashboard-content">

                <section className="dashboard-welcome">
                    <div>
                        <p className="dashboard-eyebrow">
                            DOCTOR PORTAL
                        </p>

                        <h1>Create Prescription</h1>

                        <p className="dashboard-welcome-text">
                            Prepare and save the patient's medical prescription.
                        </p>
                    </div>
                </section>

                {patient && appointmentDetails && (
                    <section className="prescription-patient-card">
                        <h2>Patient Information</h2>

                        <div className="prescription-patient-details">
                            <p><strong>Patient:</strong> {patient.name}</p>
                            <p><strong>Patient ID:</strong> {patient.patient_id}</p>
                            <p><strong>Age:</strong> {patient.age ?? "Not provided"}</p>
                            <p><strong>Gender:</strong> {patient.gender || "Not provided"}</p>
                            <p><strong>Booking ID:</strong> {appointmentDetails.booking_code}</p>
                            <p><strong>Appointment Date:</strong> {appointmentDetails.appointment_date}</p>
                            <p><strong>Time:</strong> {appointmentDetails.time_slot}</p>
                        </div>
                    </section>
                )}

                <section className="prescription-form-card">
                    <h2>Medical Prescription</h2>

                    {error && (
                        <p className="prescription-error">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="prescription-success">
                            {success}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="prescription-form">

                        <div className="prescription-form-group">
                            <label htmlFor="diagnosis">Diagnosis *</label>
                            <textarea
                                id="diagnosis"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                placeholder="Enter diagnosis..."
                                required
                                rows={3}
                            />
                        </div>

                        <div className="doctor-prescription-field">
                            <label htmlFor="medicines">Medicines *</label>
                            <textarea
                                id="medicines"
                                name="medicines"
                                value={formData.medicines}
                                onChange={handleChange}
                                placeholder="Enter medicine name, dosage, frequency and duration..."
                                required
                                rows={5}
                            />
                        </div>

                        <div className="doctor-prescription-field">
                            <label htmlFor="instructions">Instructions</label>
                            <textarea
                                id="instructions"
                                name="instructions"
                                value={formData.instructions}
                                onChange={handleChange}
                                placeholder="Enter patient instructions..."
                                rows={3}
                            />
                        </div>

                        <div className="doctor-prescription-field">
                            <label htmlFor="tests_advised">Tests Advised</label>
                            <textarea
                                id="tests_advised"
                                name="tests_advised"
                                value={formData.tests_advised}
                                onChange={handleChange}
                                placeholder="Enter tests advised..."
                                rows={3}
                            />
                        </div>

                        <div className="doctor-prescription-field">
                            <label htmlFor="follow_up_date">Follow-up Date</label>
                            <input
                                type="date"
                                id="follow_up_date"
                                name="follow_up_date"
                                value={formData.follow_up_date}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="prescription-submit-btn"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Prescription"}
                        </button>

                    </form>
                </section>

            </main>
        </div>
    );
}

export default DoctorCreatePrescription;
