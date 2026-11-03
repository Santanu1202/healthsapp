
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/RegisterDoctor.css";

function RegisterDoctor() {
    const navigate = useNavigate();

    const initialFormData = {
        name: "",
        registration_no: "",
        department: "",
        degree: "",
        phone_number: "",
        available_days: "",
        available_time: "",
        password: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const fields = [
        { name: "name", label: "Doctor Name", placeholder: "Enter doctor's full name" },
        { name: "registration_no", label: "Medical Registration Number", placeholder: "Enter registration number", maxlength:15},
        { name: "department", label: "Department", placeholder: "e.g. Cardiology" },
        { name: "degree", label: "Qualification / Degree", placeholder: "e.g. MBBS, MD" },
        { name: "phone_number", label: "Phone Number", placeholder: "Enter 10-digit phone number", type:"tel", maxlength:10, numericonly:true, },
        { name: "available_days", label: "Available Days", placeholder: "e.g. Monday, Wednesday, Friday" },
        { name: "available_time", label: "Available Time", placeholder: "e.g. 10:00 AM - 2:00 PM",maxlength:25 },
        { name: "password", label: "Password", placeholder: "Create doctor login password",maxlength:10 },
    ];

    const handleChange = (e) => {
    const { name, value } = e.target;

    const field = fields.find((item) => item.name === name);

    // Phone: reject letters and symbols
    if (field?.numericonly && !/^\d*$/.test(value)) {
        setErrors((prev) => ({
            ...prev,
            [name]: "Only digits are allowed.",
        }));
        return;
    }

    // Stop input immediately at maximum length
    if (field?.maxlength && value.length > field.maxlength) {
        setErrors((prev) => ({
            ...prev,
            [name]: `Maximum ${field.maxLength} ${name === "phone_number" ? "digits" : "characters"} allowed.`,
        }));
        return;
    }

    setFormData((prev) => ({
        ...prev,
        [name]: value,
    }));

    // Clear the error when the user corrects the field
    setErrors((prev) => ({
        ...prev,
        [name]: "",
    }));
};

   
const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
        const response = await api.post(
            "doctors/register/",
            formData
        );

        setSuccessMessage(
            `Doctor registered successfully! Doctor ID: ${response.data.doctor_id}`
        );

        setFormData(initialFormData);

    } catch (error) {
        const backendErrors = error.response?.data || {};

        setErrors(
            Object.fromEntries(
                Object.entries(backendErrors).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? value.join(" ") : String(value),
                ])
            )
        );
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="register-doctor-page">

            <div className="doctor-form-card">

                <div className="doctor-form-header">
                    <div className="doctor-icon">+</div>

                    <div>
                        <h2>Register New Doctor</h2>
                        <p>Add a new medical professional to HealthsApp</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {successMessage && (
    <div className="success-message">
        <span>✓</span>
        {successMessage}
    </div>
)}

                    <div className="doctor-form-grid">

                        {fields.map((field) => (
                            <div className="doctor-form-group" key={field.name}>
                                <label htmlFor={field.name}>
                                    {field.label}
                                    <span className="required-star">*</span>
                                </label>
                                <input
    id={field.name}
    type={field.numericonly ? "tel" : field.name === "password" ? "password" : "text"}
    inputMode={field.numericonly ? "numeric" : undefined}
    // maxLength={field.maxlength}
    name={field.name}
    value={formData[field.name]}
    onChange={handleChange}
    placeholder={field.placeholder}
    required
    disabled={loading}
/>
{errors[field.name] && (
    <small className="field-error">
        {errors[field.name]}
    </small>
)}

                            </div>
                        ))}

                    </div>

                    <div className="doctor-form-actions">

                        <button
                            type="button"
                            className="doctor-back-button"
                            onClick={() => navigate("/admin-dashboard")}
                            disabled={loading}
                        >
                            Back to Dashboard
                        </button>

                        <button
                            type="submit"
                            className="doctor-submit-button"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register Doctor"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default RegisterDoctor;
