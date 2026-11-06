import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('client@cura.demo');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'patient') {
      navigate('/dashboard');
    } else {
      alert(`Logging into ${role} workspace...`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-wrapper">
      {/* Left Brand Feature Panel */}
      <div className="login-left-panel">
        <div className="left-panel-content">
          <div className="kicker-container">
            <span className="kicker-line"></span>
            <span className="kicker-text">CARE, CONNECTED</span>
          </div>

          <h1 className="hero-heading">
            Everything <br />
            you need, <br />
            <span className="italic-text">all in one place.</span>
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
      <div className="login-right-panel">
        <div className="login-form-card">
          <span className="form-kicker">WELCOME BACK</span>
          <h2 className="form-title">Sign in to Cura</h2>
          <p className="form-subtitle">Choose your workspace and enter your details.</p>

          {/* Role Switcher Tabs */}
          <div className="workspace-tabs">
            <button
              type="button"
              className={`tab-btn ${role === 'patient' ? 'active' : ''}`}
              onClick={() => setRole('patient')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Patient</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${role === 'doctor' ? 'active' : ''}`}
              onClick={() => setRole('doctor')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 0 0 4.5 2.6V12a5 5 0 0 0 5 5h0a5 5 0 0 0 5-5V2.6a.3.3 0 0 0-.3-.3h-1.4a.3.3 0 0 0-.3.3V10a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3V2.6a.3.3 0 0 0-.3-.3H4.8z" />
                <path d="M9.5 17v4.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5V17" />
                <circle cx="14.5" cy="19.5" r="2.5" />
              </svg>
              <span>Doctor</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="8" x2="17" y2="8" />
                <line x1="7" y1="12" x2="13" y2="12" />
                <circle cx="16" cy="15" r="1.5" />
              </svg>
              <span>Administrator</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@cura.demo"
                required
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>
              <div className="input-with-icon">
                {/* <svg className="left-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8c8c8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg> */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <div className="remember-row">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-text">Keep me signed in</span>
              </label>
            </div>

            <button type="submit" className="signin-submit-btn">
              <span>Sign in</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </form>

          {/* Registration Redirect Footer */}
          <div className="register-redirect-footer">
            <span>Don't have an account? </span>
            <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
              Register here.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}