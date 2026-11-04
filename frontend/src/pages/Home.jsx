
import { useState,useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../styles/home.css";
import api from "../services/api";
import { loginuser } from "../services/authService";

// const doctors = [
//     { initials: "AS", name: "Dr. Ananya Sen", department: "Cardiology", days: "Mon – Sat", hours: "10:00 AM – 2:00 PM", available: true },
//     { initials: "RM", name: "Dr. Rahul Mehta", department: "Pediatrics", days: "Mon – Fri", hours: "9:00 AM – 1:00 PM", available: true },
//     { initials: "SR", name: "Dr. Sneha Roy", department: "Dermatology", days: "Tue, Thu, Sat", hours: "4:00 PM – 7:00 PM", available: false },
//     { initials: "IK", name: "Dr. Imran Khan", department: "Orthopedics", days: "Mon – Sat", hours: "11:00 AM – 3:00 PM", available: true }
// ];

const departments = [
    "Cardiology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology"
];

function Home() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [age, setAge] = useState("");
    const [date, setDate] = useState("");
    const [doctors, setDoctors] = useState([]);
        // Patient login states
    const [patientId, setPatientId] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
  api.get("doctors/", {
    headers: {
      Authorization: ""
    }
  })
    .then((response) => {
      console.log("Doctors from API:", response.data);
      setDoctors(response.data);
    })
    .catch((error) => {
      console.error("Error fetching doctors:", error);
    });
}, []);

    const [department, setDepartment] = useState("");
    const [search, setSearch] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("All departments");
    const [notice, setNotice] = useState("");
    // Public booking tracking states
    const [trackingOpen, setTrackingOpen] = useState(false);
    const [bookingId, setBookingId] = useState("");
    const [trackedAppointment, setTrackedAppointment] = useState(null);
    const [trackingError, setTrackingError] = useState("");
    const [trackingLoading, setTrackingLoading] = useState(false);  
    const today = new Date();
    const dateString = (value) => {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, "0");
        const d = String(value.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);

    const filteredDoctors = doctors.filter((doctor) => {
        const matchesSearch =
            `${doctor.name} ${doctor.department}`
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesDepartment =
            filterDepartment === "All departments" ||
            doctor.department === filterDepartment;

        return matchesSearch && matchesDepartment;
    });

    const handleBooking = (event) => {
        event.preventDefault();
        setNotice(
            "Your details are ready. Online booking will be enabled when we connect this form to the patient and doctor APIs."
        );
    };
    const handlePatientLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
        const data = await loginuser(patientId.trim(), password);

        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        navigate("/dashboard");
    } catch (error) {
        setLoginError(
            error.response?.data?.error ||
            "Login failed. Please check your Patient ID and password."
        );
    } finally {
        setLoginLoading(false);
    }
};
     const handleTrackBooking = async (event) => {
    event.preventDefault();

    setTrackedAppointment(null);
    setTrackingError("");

    if (!bookingId.trim()) {
        setTrackingError("Please provide Booking ID.");
        return;
    }

    try {
        setTrackingLoading(true);

        const response = await api.get(
            `track-booking/?booking_id=${encodeURIComponent(bookingId.trim())}`
        );

        setTrackedAppointment(response.data);

    } catch (error) {
        setTrackingError(
            error.response?.data?.error ||
            "Unable to find booking. Please try again."
        );
    } finally {
        setTrackingLoading(false);
    }
};

    const chooseDoctor = (doctor) => {
        setDepartment(doctor.department);
        document.getElementById("booking-form")?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    };

    return (
        <div className="home-page">
            <header className="home-header">
                <div className="home-header-inner">
                    <Link to="/" className="home-brand">
                        <span className="brand-icon">+</span>
                        <span>Healthsapp</span>
                    </Link>

                    <nav className="home-nav">
                        <a href="#services">Services</a>
                        <a href="#about">About us</a>
                    </nav>

                    <div className="home-header-actions">
                        <Link to="/doctor-login" className="btn btn-outline">
                            Doctor login
                        </Link>
                        <Link to="/admin-login" className="btn btn-dark">
                            Admin login
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="hero-section">
                    <div className="hero-inner">
                        <div className="hero-left">
                            <span className="eyebrow">
                                Online doctor appointments
                            </span>

                            <h1>
                                Book the right doctor,
                                <span> without the wait.</span>
                            </h1>

                            <p className="hero-description">
                                Share a few basic details, pick a time when your
                                doctor is in, and track your booking from start
                                to finish.
                            </p>

                            <div className="hero-actions">
                                <a href="#booking-form" className="btn btn-primary">
                                    Book now
                                </a>
                                <a href="#services" className="btn btn-outline schedule-link">
                                    Doctor time schedule
                                </a>
                            </div>

                            <div className="doctor-search-card">
                                <h3>Find doctors by department</h3>

                                <form
                                    className="doctor-search-row"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        document.getElementById("services")?.scrollIntoView({
                                            behavior: "smooth"
                                        });
                                    }}
                                >
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Doctor name or condition"
                                        aria-label="Search doctors"
                                    />

                                    <select
                                        value={filterDepartment}
                                        onChange={(event) => setFilterDepartment(event.target.value)}
                                        aria-label="Filter by department"
                                    >
                                        <option>All departments</option>
                                        {departments.map((item) => (
                                            <option key={item}>{item}</option>
                                        ))}
                                    </select>

                                    <button className="btn btn-dark" type="submit">
                                        Find doctors
                                    </button>
                                </form>

                                <div className="department-tags">
                                    {departments.map((item) => (
                                        <button
                                            type="button"
                                            key={item}
                                            className="department-tag"
                                            onClick={() => setFilterDepartment(item)}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="track-link">
    <p>
        Already booked?{" "}
        <button
            type="button"
            onClick={() => {
                setTrackingOpen(!trackingOpen);
                setTrackingError("");
                setTrackedAppointment(null);
            }}
        >
            Track your booking →
        </button>
    </p>

    {trackingOpen && (
        <div className="booking-tracking-box">
            <form onSubmit={handleTrackBooking}>
                <input
                    type="text"
                    placeholder="Enter your Booking ID (e.g. HB0104)"
                    value={bookingId}
                    onChange={(event) => setBookingId(event.target.value)}
                />

                <button type="submit" disabled={trackingLoading}>
                    {trackingLoading ? "Searching..." : "Track Booking"}
                </button>
            </form>

            {trackingError && (
                <p className="tracking-error" role="alert">
                    {trackingError}
                </p>
            )}

            {trackedAppointment && (
                <div className="tracking-result">
                    <h3>Appointment Details</h3>

                    <p><strong>Booking ID:</strong> {trackedAppointment.booking_code}</p>
                    <p><strong>Patient Name:</strong> {trackedAppointment.patient_name}</p>
                    <p><strong>Doctor:</strong> {trackedAppointment.doctor_name}</p>
                    <p><strong>Date:</strong> {trackedAppointment.appointment_date}</p>
                    <p><strong>Time:</strong> {trackedAppointment.time_slot}</p>
                    <p><strong>Status:</strong> {trackedAppointment.status}</p>
                    <p><strong>Symptoms:</strong> {trackedAppointment.symptoms}</p>
                </div>
            )}
        </div>
    )}
</div>
                        </div>

                        
<section className="booking-card patient-login-card" id="booking-form">
    <div className="patient-login-heading">
        <div className="patient-login-icon">+</div>
        <h2>Welcome to HealthsApp</h2>
        <p>Log in to book appointments and manage your medical records.</p>
    </div>

    <form onSubmit={handlePatientLogin}>
        <label htmlFor="patient-login-id">Patient ID</label>
        <input
            id="patient-login-id"
            type="text"
            placeholder="Enter your Patient ID (e.g. HP05)"
            value={patientId}
            onChange={(event) => setPatientId(event.target.value)}
            required
        />

        <label htmlFor="patient-login-password">Password</label>
        <input
            id="patient-login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
        />

        {loginError && (
            <p className="patient-login-error" role="alert">
                {loginError}
            </p>
        )}

        <button
            className="btn btn-primary booking-submit"
            type="submit"
            disabled={loginLoading}
        >
            {loginLoading ? "Logging in..." : "Log in & Book Appointment"}
        </button>

        <div className="patient-register-option">
            <p>New to HealthsApp?</p>
            <Link to="/register" className="btn btn-outline">
                Create New Patient ID
            </Link>
        </div>
    </form>
</section>

                    </div>
                </section>

                <section className="schedule-section" id="services">
                    <div className="section-heading">
                        <div>
                            <h2>Doctor time schedule</h2>
                            <p>See when each doctor is in before you book.</p>
                        </div>
                        <a href="#services">View full schedule →</a>
                    </div>

                    <div className="doctor-grid">
                        {filteredDoctors.map((doctor) => (
                            <article className="doctor-card" key={doctor.id}>
                                <div className="doctor-info">
                                    <div className="doctor-avatar">
                                       {doctor.name
                                         .replace(/^Dr\.?\s*/i, "")
                                         .split(/\s+/)
                                         .map((part) => part[0])
                                         .slice(0, 2)
                                         .join("")
                                        .toUpperCase()}
                                    </div>
                                    <div>
                                        <h3>{doctor.name}</h3>
                                        <p>{doctor.department}</p>
                                    </div>
                                </div>

                                <p className="doctor-hours">
                                    {doctor.available_days} · {doctor.available_time}
                                </p>

                                <span className="availability is-available">
                                    Schedule available
                                </span>

                                <button
                                    type="button"
                                    className="btn doctor-book-btn"
                                    onClick={() => {
                                       setNotice("Please log in to your patient account to book an appointment.");
                                       document.getElementById("booking-form")?.scrollIntoView({
                                         behavior: "smooth",
                                         block: "center",
                                        });
                                    }}>
                                     Patient login to book
                                </button>
                            </article>
                        ))}

                        {filteredDoctors.length === 0 && (
                            <p>No matching doctors found. Try another search.</p>
                        )}
                    </div>
                </section>
            </main>

            <footer className="home-footer" id="about">
                <div className="footer-grid">
                    <div>
                        <Link to="/" className="footer-brand">
                            <span className="brand-icon">+</span>
                            <span>Healthsapp</span>
                        </Link>
                        <p>
                            Book doctors, see their time, and track every
                            booking in one place.
                        </p>
                    </div>

                    <div>
                        <h3>Location</h3>
                        <p>[Clinic or hospital address]</p>
                        <p>[City, State, PIN]</p>
                        <p>Open [days] · [hours]</p>
                    </div>

                    <div>
                        <h3>Contact us</h3>
                        <p>[Phone number]</p>
                        <p>[Email address]</p>
                    </div>

                    <div>
                        <h3>Follow us</h3>
                        <div className="social-links">
                            <a href="#about">Facebook</a>
                            <a href="#about">Instagram</a>
                            <a href="#about">YouTube</a>
                            <a href="#about">LinkedIn</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    © 2026 Healthsapp. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default Home;
