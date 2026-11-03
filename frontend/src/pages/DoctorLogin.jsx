
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/DoctorLogin.css";

function DoctorLogin() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        doctor_id: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await api.post(
                "doctors/login/",
                {
                    doctor_id: formData.doctor_id.trim().toUpperCase(),
                    password: formData.password,
                }
            );

            // Doctor authentication and token storage
            localStorage.setItem(
                "doctorAccessToken",
                response.data.access
            );

            localStorage.setItem(
                "doctorRefreshToken",
                response.data.refresh
            );

            localStorage.setItem(
                "doctorId",
                response.data.doctor_id
            );

            localStorage.setItem(
                "doctorName",
                response.data.name
            );

            navigate("/doctor-dashboard");

        } catch (error) {
            const responseData = error.response?.data;

            setError(
                responseData?.error ||
                responseData?.detail ||
                "Invalid Doctor ID or password."
            );
        } finally {
            setLoading(false);
        }
    };

    
return (
    <div className="doctor-login-page">

        <div className="doctor-login-card">

            <div className="doctor-login-header">
                <h2>HealthsApp</h2>
                <p>Doctor Login</p>
            </div>

            <form onSubmit={handleSubmit}>

                <div className="doctor-login-form-group">
                    <input
                        type="text"
                        id="doctor_id"
                        name="doctor_id"
                        placeholder="Enter Doctor ID (e.g. HD01)"
                        value={formData.doctor_id}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="doctor-login-form-group">
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="doctor-login-error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="doctor-login-button"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Doctor Login"}
                </button>

            </form>

            <button
                type="button"
                className="doctor-back-button"
                onClick={() => navigate("/")}
                disabled={loading}
            >
                Back to Home
            </button>

        </div>

    </div>
);

}

export default DoctorLogin;
