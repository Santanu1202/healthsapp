
import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/book-appointment.css";

function BookAppointments() {
    const [doctors, setDoctors] = useState([]);
    const [department, setDepartment] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [message, setMessage] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [submittingBooking, setSubmittingBooking] = useState(false);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const response = await api.get("doctors/");
                setDoctors(response.data);
            } catch (error) {
                console.error("Failed to load doctors:", error);
                setMessage("Unable to load doctors. Please try again.");
            } finally {
                setLoadingDoctors(false);
            }
        };

        loadDoctors();
    }, []);

    const departments = [
        ...new Set(
            doctors
                .map((doctor) => doctor.department?.trim())
                .filter(Boolean)
        ),
    ].sort((a, b) => a.localeCompare(b));

    const filteredDoctors = doctors.filter(
        (doctor) => doctor.department?.trim() === department
    );

    const selectedDoctor = doctors.find(
        (doctor) => String(doctor.id) === doctorId
    );

    const handleDepartmentChange = (value) => {
        setDepartment(value);
        setDoctorId("");
        setAppointmentDate("");
        setAvailableSlots([]);
        setSelectedSlot("");
        setMessage("");
    };

    const handleDoctorChange = (value) => {
        setDoctorId(value);
        setAppointmentDate("");
        setAvailableSlots([]);
        setSelectedSlot("");
        setMessage("");
    };

    const checkAvailability = async () => {
        if (!doctorId || !appointmentDate) {
            setMessage("Please select a doctor and date.");
            return;
        }

        setLoadingSlots(true);
        setMessage("");
        setAvailableSlots([]);
        setSelectedSlot("");

        try {
            const response = await api.get("check_availability/", {
                params: {
                    doctor_id: doctorId,
                    date: appointmentDate,
                },
            });

            setAvailableSlots(response.data.available_slots || []);
            setMessage(
                response.data.message || "Availability checked."
            );
        } catch (error) {
            setMessage(
                error.response?.data?.error ||
                "Could not check availability."
            );
        } finally {
            setLoadingSlots(false);
        }
    };
    
const confirmBooking = async () => {
    if (!selectedDoctor || !appointmentDate || !selectedSlot || !symptoms.trim()) {
        setMessage("Please complete all booking details.");
        return;
    }

    setSubmittingBooking(true);
    setMessage("");
    setBookingSuccess(null);

    try {
        const response = await api.post("book-appointment/", {
            doctor: Number(doctorId),
            appointment_date: appointmentDate,
            time_slot: selectedSlot,
            symptoms: symptoms.trim(),
        });

        setBookingSuccess(response.data);
        setConfirming(false);
        setAvailableSlots([]);
        setSelectedSlot("");
        setSymptoms("");
    } catch (error) {
        const errorData = error.response?.data;

        setMessage(
            errorData?.error ||
            errorData?.detail ||
            "Booking failed. Please try again."
        );

        // Refresh slots if the selected slot is no longer available.
        if (error.response?.status === 409) {
            setAvailableSlots([]);
            setSelectedSlot("");
            setConfirming(false);
        }
    } finally {
        setSubmittingBooking(false);
    }
 };

    return (
        <div className="booking-page">
            <main className="booking-card">
                <div className="booking-heading">
                    <div className="booking-heading-icon">+</div>
                    <p className="booking-eyebrow">HEALTHSAPP PATIENT PORTAL</p>
                    <h1>Book an Appointment</h1>
                    <p>
                        Select your department, doctor, date and available
                        time slot.
                    </p>
                </div>

                <div className="booking-step">
                    <span className="booking-step-number">1</span>
                    <label htmlFor="department">Select Department</label>
                </div>

                <select
                    id="department"
                    value={department}
                    onChange={(event) =>
                        handleDepartmentChange(event.target.value)
                    }
                    disabled={loadingDoctors || doctors.length === 0}
                    className="booking-control"
                >
                    <option value="">
                        {loadingDoctors
                            ? "Loading departments..."
                            : "Choose a department"}
                    </option>
                    {departments.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>

                <div className="booking-step">
                    <span className="booking-step-number">2</span>
                    <label htmlFor="doctor">Select Doctor</label>
                </div>

                <select
                    id="doctor"
                    value={doctorId}
                    onChange={(event) =>
                        handleDoctorChange(event.target.value)
                    }
                    disabled={!department}
                    className="booking-control"
                >
                    <option value="">
                        {department
                            ? "Choose a doctor"
                            : "Select a department first"}
                    </option>
                    {filteredDoctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.name} — {doctor.degree}
                        </option>
                    ))}
                </select>

                {selectedDoctor && (
                    <div className="doctor-schedule">
                        <strong>Doctor availability</strong>
                        <p>
                            <span>Working days:</span>{" "}
                            {selectedDoctor.available_days}
                        </p>
                        <p>
                            <span>Working hours:</span>{" "}
                            {selectedDoctor.available_time}
                        </p>
                    </div>
                )}

                <div className="booking-step">
                    <span className="booking-step-number">3</span>
                    <label htmlFor="appointment-date">Select Date</label>
                </div>

                <input
                    id="appointment-date"
                    type="date"
                    value={appointmentDate}
                    min={new Date().toLocaleDateString("en-CA")}
                    onChange={(event) => {
                        setAppointmentDate(event.target.value);
                        setAvailableSlots([]);
                        setSelectedSlot("");
                        setMessage("");
                    }}
                    disabled={!doctorId}
                    className="booking-control"
                />

                <button
                    type="button"
                    onClick={checkAvailability}
                    disabled={!doctorId || !appointmentDate || loadingSlots}
                    className="booking-primary-button"
                >
                    {loadingSlots
                        ? "Checking availability..."
                        : "Check Available Time Slots"}
                </button>

                {availableSlots.length > 0 && (
                    <>
                        <div className="booking-step">
                            <span className="booking-step-number">4</span>
                            <label>Select Time Slot</label>
                        </div>

                        <div className="booking-slot-grid">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`booking-slot ${
                                        selectedSlot === slot
                                            ? "booking-slot-selected"
                                            : ""
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                
{selectedSlot && (
    <div className="booking-symptoms">
        <h3>Appointment Details</h3>

        <p>
            <strong>Department:</strong> {department}
        </p>
        <p>
            <strong>Doctor:</strong> Dr. {selectedDoctor?.name}
        </p>
        <p>
            <strong>Date:</strong> {appointmentDate}
        </p>
        <p>
            <strong>Time:</strong> {selectedSlot}
        </p>

        <label htmlFor="symptoms">Describe your symptoms</label>
        <textarea
            id="symptoms"
            value={symptoms}
            onChange={(event) => setSymptoms(event.target.value)}
            placeholder="Briefly describe your symptoms"
            rows={4}
            className="booking-control"
            disabled={confirming}
        />

        {!confirming ? (
            <button
                type="button"
                className="booking-primary-button"
                disabled={!symptoms.trim()}
                onClick={() => {
                    setMessage("");
                    setConfirming(true);
                }}
            >
                Continue to Confirmation
            </button>
        ) : (
            <div className="booking-confirmation">
                <h3>Confirm Your Appointment</h3>
                <p>Would you like to confirm this appointment?</p>

                <button
                    type="button"
                    className="booking-primary-button"
                    onClick={confirmBooking}
                    disabled={submittingBooking}
                >
                    {submittingBooking
                        ? "Booking..."
                        : "Confirm Booking"}
                </button>

                <button
                    type="button"
                    className="booking-secondary-button"
                    disabled={submittingBooking}
                    onClick={() => setConfirming(false)}
                >
                    Go Back
                </button>
            </div>
        )}
    </div>
)}



               

{bookingSuccess && (
    <div className="booking-success" role="status">
        <h3>Appointment Booked Successfully!</h3>
        <p>
            <strong>Booking ID:</strong>{" "}
            {bookingSuccess.booking_code ??
             bookingSuccess.data?.booking_code ??
             "See appointment details"}
        </p>
        <p>
            <strong>Status:</strong> {bookingSuccess.status}
        </p>
        <p>{bookingSuccess.message}</p>
    </div>
)}

{message && (
    <p className="booking-message" role="alert">
        {message}
    </p>
)}

            </main>
        </div>
    );
}

export default BookAppointments;
