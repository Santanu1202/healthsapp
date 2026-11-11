
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookAppointment from "./pages/BookAppointment";
import PatientAppointments from "./pages/PatientAppointments";
import DoctorAppointments from "./pages/DoctorAppointments";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import RegisterDoctor from "./pages/RegisterDoctor";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import MedicalHistory from "./pages/MedicalHistory";
import DoctorPatientDetails from "./pages/DoctorPatientDetails";
import DoctorCreatePrescription from "./pages/DoctorCreatePrescription";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
    path="/admin-dashboard"
    element={
        <AdminProtectedRoute>
            <AdminDashboard />
        </AdminProtectedRoute>
    }
/>
            <Route
    path="/register-doctor"
    element={
        <AdminProtectedRoute>
            <RegisterDoctor />
        </AdminProtectedRoute>
    }
/>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
            <Route path="/patient-appointments" element={<ProtectedRoute><PatientAppointments /></ProtectedRoute>} />
            <Route path="/doctor-login" element={<DoctorLogin />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />}/>
            <Route path="/register" element={<Register />} />
            <Route path="/doctor-appointments" element={<ProtectedRoute><DoctorAppointments /></ProtectedRoute>} />
            <Route
                path="/doctor/patient/:patientId/appointment/:appointmentId"
                element={<DoctorPatientDetails />}
            />
            <Route
    path="/doctor/create-prescription/:patientId/:appointmentId"
    element={<DoctorCreatePrescription />}
/>
            <Route
    path="/prescriptions"
    element={
        <ProtectedRoute>
            <PatientPrescriptions />
        </ProtectedRoute>
    }
/>

<Route
    path="/medical-history"
    element={
        <ProtectedRoute>
            <MedicalHistory />
        </ProtectedRoute>
    }
/>
        </Routes>
    );
    
}

export default App;
