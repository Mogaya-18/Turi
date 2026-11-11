import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "Patient",
    employeeCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const targetRole = formData.role.toLowerCase();

    // Verify employee code if signing up as Doctor or Administrator
    if (
      targetRole === "doctor" ||
      targetRole === "administrator" ||
      targetRole === "admin"
    ) {
      if (!formData.employeeCode) {
        setError(
          `An employee code is required to register as a ${formData.role}.`,
        );
        setLoading(false);
        return;
      }

      const { data: codeRecord, error: codeError } = await supabase
        .from("employee_codes")
        .select("*")
        .eq("code", formData.employeeCode)
        .single();

      if (codeError || !codeRecord) {
        setError(
          "Invalid employee code. Please verify with clinic management.",
        );
        setLoading(false);
        return;
      }
    }

    // Register user via Supabase Auth
    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          role: targetRole === "administrator" ? "admin" : targetRole,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      alert(`Account registered successfully for ${formData.fullName}!`);
      navigate("/login");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-left-panel">
        <div className="left-panel-content">
          <div className="kicker-container">
            <span className="kicker-line"></span>
            <span className="kicker-text">CARE, CONNECTED</span>
          </div>

          <h1 className="hero-heading">
            Join Turi <br />
            and manage <br />
            <span className="italic-text">your health seamlessly.</span>
          </h1>
        </div>
      </div>

      <div className="register-right-panel">
        <div className="register-form-card">
          <span className="form-kicker">GET STARTED</span>
          <h2 className="form-title">Account Registration</h2>

          {error && <div className="auth-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Account Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="role-select"
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            {formData.role !== "Patient" && (
              <div className="input-group">
                <label>Employee Code</label>
                <input
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  placeholder={
                    formData.role === "Doctor"
                      ? "Enter Doctor Code"
                      : "Enter Administrator Code"
                  }
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="register-submit-btn"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="login-redirect-footer">
            <span>Already have an account? </span>
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Log in here.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
