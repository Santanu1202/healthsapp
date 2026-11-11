import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DoctorDashboard.css";
import api from "../services/api";
function DoctorDashboard() {
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [previousAppointments, setPreviousAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const doctorName = localStorage.getItem("doctorName") || "Doctor";
    const doctorId = localStorage.getItem("doctorId") || "";
    useEffect(() => {
    const fetchAppointments = async () => {
        try {
            const response = await api.get(
                "doctor-dashboard/"
            );

            setTodayAppointments(
                response.data.today_appointments
            );

            setUpcomingAppointments(
                response.data.upcoming_appointments
            );

            setPreviousAppointments(
                response.data.previous_appointments
            );

        } catch (error) {
            setError(
                error.response?.data?.detail ||
                "Unable to load appointments."
            );
        } finally {
            setLoading(false);
        }
    };

    fetchAppointments();
}, []);
    const handleLogout = () => {
        localStorage.removeItem("doctorAccessToken");
        localStorage.removeItem("doctorRefreshToken");
        localStorage.removeItem("doctorId");
        localStorage.removeItem("doctorName");

        navigate("/doctor-login");
    };

    return (
        <div className="doctor-dashboard">

            {/* Sidebar */}
            <aside className="doctor-sidebar">

                <div className="doctor-sidebar-brand">
                    <h2>HealthsApp</h2>
                    <p>Doctor Portal</p>
                </div>

                <nav className="doctor-sidebar-nav">
                    <button className="doctor-nav-item active">
                        <span>▦</span>
                        Dashboard
                    </button>
                    
<div className="doctor-sidebar-stats">

    <div className="doctor-sidebar-stat">
        <span>Total Appointments</span>
        <h3>
            {todayAppointments.length +
             upcomingAppointments.length +
             previousAppointments.length}
        </h3>
    </div>

    <div className="doctor-sidebar-stat">
        <span>Today's Appointments</span>
        <h3>{todayAppointments.length}</h3>
    </div>

</div>

                </nav>

                <button
                    className="doctor-logout-button"
                    onClick={handleLogout}
                >
                    ↪ Logout
                </button>

            </aside>

            {/* Main Content */}
            <main className="doctor-main-content">

                {/* Header */}
                <header className="doctor-topbar">
                    <div>
                        <h2>Doctor Dashboard</h2>
                        <p>Manage your appointments and patients</p>
                    </div>

                    <div className="doctor-profile">
                        <div className="doctor-avatar">
                            {doctorName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h4>Dr. {doctorName}</h4>
                            <span>{doctorId}</span>
                        </div>
                    </div>
                </header>

                {/* Welcome */}
                <section className="doctor-welcome">
                    <div>
                        <h2>Welcome back, {doctorName}!</h2>
                        <p>
                            Here's your doctor portal. Manage your
                            daily appointments and patient care.
                        </p>
                    </div>
                </section>

              

                {/* Appointments */}
                
{/* Appointments */}

{loading ? (
    <div className="doctor-appointments-section">
        <p>Loading appointments...</p>
    </div>
) : error ? (
    <div className="doctor-appointments-section">
        <p className="doctor-login-error">{error}</p>
    </div>
) : (
    <>
        {/*Today Appointments */}
        <section className="doctor-appointments-section">

            <div className="doctor-section-heading">
                <div>
                    <h2>Today's Appointments</h2>
                    <p>Patients scheduled for today.</p>
                </div>
                <span>{todayAppointments.length} Appointments</span>
            </div>

            <div className="doctor-table-wrapper">
                <table className="doctor-appointment-table">
                    <thead>
                        <tr>
                            <th>Patient ID</th>
                            <th>Patient Name</th>
                            <th>Time</th>
                            <th>Symptoms</th>
                        </tr>
                    </thead>

                    <tbody>
                        {todayAppointments.length > 0 ? (
                            todayAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>
                                        <button
    className="patient-id-link"
    type="button"
    onClick={() => {
        alert("Patient button clicked!");

        navigate(
            `/doctor/patient/${appointment.patient_id}/appointment/${appointment.id}`
        );
    }}
>
    {appointment.patient_id}
</button>
                                    </td>

                                    <td>{appointment.patient_name}</td>
                                    <td>{appointment.time_slot}</td>
                                    <td>{appointment.symptoms}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="doctor-no-data">
                                    No appointments scheduled for today.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </section>
        {/* upcoming's Appointments */}
        <section className="doctor-appointments-section">

            <div className="doctor-section-heading">
                <div>
                    <h2>Upcoming's Appointments</h2>
                    <p>Patients scheduled for upcoming dates.</p>
                </div>
                <span>{todayAppointments.length} Appointments</span>
            </div>

            <div className="doctor-table-wrapper">
                <table className="doctor-appointment-table">
                    <thead>
                        <tr>
                            <th>Patient ID</th>
                            <th>Patient Name</th>
                            <th>Appointment Date </th>
                            <th>Appointment Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>
                                        <button
                                            className="patient-id-link"
                                            type="button"
                                            onClick={() => {
                                                        // console.log("Navigating to patient details...");
                                                        alert("Patient button clicked!");
                                                        navigate(
                                                           `/doctor/patient/${appointment.patient_id}/appointment/${appointment.id}`
                                                        );
                                                    }}
                                        >
                                            {appointment.patient_id}
                                        </button>
                                    </td>

                                    <td>{appointment.patient_name}</td>
                                    <td>{appointment.appointment_date}</td>
                                     <td>{appointment.time_slot}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="doctor-no-data">
                                    No upcoming appointments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </section>

        {/* Previous Appointments */}
        <section className="doctor-appointments-section">

            <div className="doctor-section-heading">
                <div>
                    <h2>Previous Appointments</h2>
                    <p>Your previous patient appointments.</p>
                </div>
                <span>{previousAppointments.length} Appointments</span>
            </div>

            <div className="doctor-table-wrapper">
                <table className="doctor-appointment-table">
                    <thead>
                        <tr>
                            <th>Patient ID</th>
                            <th>Patient Name</th>
                            <th>Appointment Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {previousAppointments.length > 0 ? (
                            previousAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>
                                        <button
    className="patient-id-link"
    type="button"
    onClick={() => {
        alert("Patient button clicked!");

        navigate(
            `/doctor/patient/${appointment.patient_id}/appointment/${appointment.id}`
        );
    }}
>
    {appointment.patient_id}
</button>
                                    </td>

                                    <td>{appointment.patient_name}</td>
                                    <td>{appointment.appointment_date}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="doctor-no-data">
                                    No previous appointments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </section>
    </>
)}


            </main>

        </div>
    );
}

export default DoctorDashboard;
