
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/PatientAppointment.css";

function PatientAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const handleCancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm(
        "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
        await api.patch(`cancel-appointment/${appointmentId}/`);

        setAppointments((previous) =>
            previous.map((appointment) =>
                appointment.id === appointmentId
                    ? { ...appointment, status: "Canceled" }
                    : appointment
            )
        );
    } catch (err) {
        setError(
            err.response?.data?.error ||
            "Unable to cancel appointment."
        );
    }
};
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get("patient-appointments/");

                setAppointments(
                    Array.isArray(response.data)
                        ? response.data
                        : response.data.appointments || []
                );
            } catch (err) {
                console.error("Appointment API error:", err);

                setError(
                    err.response?.data?.error ||
                    err.response?.data?.detail ||
                    "Unable to load your appointments."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    return (
        <div className="patient-appointments-page">
            <div className="patient-appointments-header">
                <h1>My Appointments</h1>
                <p>View and manage your scheduled appointments.</p>
            </div>

            {loading && (
                <p className="patient-appointments-message">
                    Loading your appointments...
                </p>
            )}

            {error && (
                <p className="patient-appointments-error">{error}</p>
            )}

            {!loading && !error && appointments.length === 0 && (
                <div className="patient-appointments-empty">
                    <h3>No appointments found</h3>
                    <p>You haven't booked any appointments yet.</p>
                </div>
            )}

            <div className="patient-appointments-grid">
                {appointments.map((appointment) => (
                    <article
                        className="patient-appointment-card"
                        key={appointment.id}
                    >
                        <div className="patient-appointment-card-header">
                            <div>
                                <span className="patient-booking-label">
                                    Booking ID
                                </span>
                                <h3>
                                    {appointment.booking_code ||
                                        "Booking ID unavailable"}
                                </h3>
                            </div>

                            <span
                                className={`patient-status-badge ${
                                    appointment.status?.toLowerCase()
                                }`}
                            >
                                {appointment.status}
                            </span>
                        </div>

                        <div className="patient-appointment-details">
                            <p>
                                <strong>Doctor:</strong>{" "}
                                {appointment.doctor_name ||
                                    appointment.doctor?.name ||
                                    "Not available"}
                            </p>

                            <p>
                                <strong>Date:</strong>{" "}
                                {appointment.appointment_date}
                            </p>

                            <p>
                                <strong>Time:</strong>{" "}
                                {appointment.time_slot}
                            </p>

                            <p>
                                <strong>Symptoms:</strong>{" "}
                                {appointment.symptoms || "Not provided"}
                            </p>
                        </div>
                        
{["Pending", "Approved"].includes(appointment.status) && (
    <div className="patient-appointment-actions">
        <button
            type="button"
            className="patient-cancel-button"
            onClick={() =>
                handleCancelAppointment(appointment.id)
            }
        >
            Cancel Appointment
        </button>
    </div>
)}

                    </article>
                ))}
            </div>
        </div>
    );
}

export default PatientAppointments;
