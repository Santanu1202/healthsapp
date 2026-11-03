
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/register.css";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        phone_number: "",
        address: "",
        age: "",
        password: "",
        gender: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    // const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleRegister = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("accounts/register/", {
                ...formData,
                age: Number(formData.age),
            });

            const generatedPatientId =
                response.data.patient_id ||
                response.data.data?.patient_id;

            if (generatedPatientId) {
                alert(
                    `Registration successful!\nYour Patient ID is: ${generatedPatientId}`
                );
                navigate("/login");
            } else {
                setError(
                    "Registration response did not include a Patient ID."
                );
            }
        } catch (error) {
            const responseData = error.response?.data;

            setError(
                typeof responseData === "string"
                    ? responseData
                    : responseData
                        ? JSON.stringify(responseData)
                        : "Registration failed. Please check your connection."
            );

            console.error("Registration failed:", responseData || error);
        } finally {
            setLoading(false);
        }
    };
    const countWords = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <div className="register-icon">+</div>
                    <h1>Create Patient Account</h1>
                    <p>Register with HealthsApp to book appointments.</p>
                </div>

                <form className="register-form" onSubmit={handleRegister}>
                    <label htmlFor="name">Full name</label>
                    <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                    />
                    
<div className="register-two-columns">
    <div>
        <label htmlFor="phone_number">Mobile number</label>
        <input
            id="phone_number"
            name="phone_number"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            autoComplete="tel"
            required
        />
    </div>

    <div>
        <label htmlFor="age">Age</label>
        <input
            id="age"
            name="age"
            type="number"
            min="1"
            max="120"
            value={formData.age}
            onChange={handleChange}
            placeholder="Your age"
            required
        />
    </div>

    <fieldset className="register-gender">
        <legend>Gender</legend>

        <label>
            <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
                required
            />
            Male
        </label>

        <label>
            <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
                required
            />
            Female
        </label>
    </fieldset>
</div>

                    
<label htmlFor="address">Address</label>
<textarea
    id="address"
    name="address"
    value={formData.address}
    onChange={handleChange}
    placeholder="Enter your address (maximum 450 words)"
    rows={3}
    maxLength={250}
    autoComplete="street-address"
    required
/>

<p className="address-word-count">
    {formData.address.length} / 250 characters
</p>


                    <label htmlFor="password">Password</label>
                    <div className="register-password-wrapper">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            minLength={8}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password (minimum 8 characters)"
                            autoComplete="new-password"
                            required
                        />

                        {/* <button
                            type="button"
                            className="register-password-toggle"
                            onClick={() =>
                                setShowPassword((previous) => !previous)
                            }
                            aria-label={
                                showPassword
                                    ? "Hide password"
                                    : "Show password"
                            }
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button> */}
                    </div>

                    {error && (
                        <p className="register-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="register-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Patient ID"}
                    </button>
                </form>

                <p className="register-footer">
                    Already registered? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
