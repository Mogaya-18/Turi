import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'Patient',
    roleSpecificField: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Account registered successfully for ${formData.fullName} as a ${formData.role}!`);
    navigate('/login');
  };

  return (
    <div className="register-wrapper">
      {/* Left Brand Feature Panel */}
      <div className="register-left-panel">
        <div className="left-panel-content">
          <div className="kicker-container">
            <span className="kicker-line"></span>
            <span className="kicker-text">CARE, CONNECTED</span>
          </div>

          <h1 className="hero-heading">
            Join Cura <br />
            and manage <br />
            <span className="italic-text">your health seamlessly.</span>
          </h1>

          <ul className="feature-checklist">
            <li>
              <div className="check-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Easy appointment management</span>
            </li>
            <li>
              <div className="check-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Private messages with your care team</span>
            </li>
            <li>
              <div className="check-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>Secure access to health records</span>
            </li>
          </ul>
        </div>

        {/* Decorative background overlay circles */}
        <div className="bg-glow-circle circle-1"></div>
        <div className="bg-glow-circle circle-2"></div>
      </div>

      {/* Right Form Panel */}
      <div className="register-right-panel">
        <div className="register-form-card">
          <span className="form-kicker">GET STARTED</span>
          <h2 className="form-title">Account Registration</h2>
          <p className="form-subtitle">Fill in your details to create your Cura account.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full Name */}
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

            {/* Email */}
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

            {/* Phone Number */}
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

            {/* Password */}
            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Role Dropdown */}
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

            {/* Dynamic Role-Specific Field */}
            <div className="input-group">
              <label>
                {formData.role === 'Patient'
                  ? 'Additional Details'
                  : formData.role === 'Doctor'
                  ? 'Medical License / Specialization'
                  : 'Department Code'}
              </label>
              <input
                type="text"
                name="roleSpecificField"
                value={formData.role === 'Patient' ? '' : formData.roleSpecificField}
                onChange={handleChange}
                placeholder={
                  formData.role === 'Patient'
                    ? 'N/A for Patients'
                    : formData.role === 'Doctor'
                    ? 'e.g. Cardiology - MD-90412'
                    : 'e.g. ADM-8023'
                }
                disabled={formData.role === 'Patient'}
                className={formData.role === 'Patient' ? 'disabled-input' : ''}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="register-submit-btn">
              Register
            </button>
          </form>

          {/* Footer Link */}
          <div className="login-redirect-footer">
            <span>Already have an account? </span>
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Log in here.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}