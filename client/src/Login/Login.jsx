import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Authenticate credentials with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim().toLowerCase(),
          password,
        },
      );

      if (authError) throw authError;

      const user = data.user;

      // 2. Fetch user profile by ID, fallback by email match
      let { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        const { data: profileByEmail } = await supabase
          .from("profiles")
          .select("role")
          .ilike("email", user.email)
          .maybeSingle();
        profile = profileByEmail;
      }

      // If no profile record found, fall back to auth user metadata
      const assignedRole = (
        profile?.role ||
        user.user_metadata?.role ||
        "patient"
      ).toLowerCase();
      const selectedRole = role.toLowerCase();

      const normalizedSelected =
        selectedRole === "administrator" ? "admin" : selectedRole;
      const normalizedAssigned =
        assignedRole === "administrator" ? "admin" : assignedRole;

      // 3. Role matching validation
      if (normalizedSelected !== normalizedAssigned) {
        await supabase.auth.signOut();
        throw new Error(
          `Access denied. Your account is registered as a ${assignedRole.toUpperCase()}, not a ${selectedRole.toUpperCase()}.`,
        );
      }

      // 4. Navigate to correct workspace
      switch (normalizedAssigned) {
        case "doctor":
          navigate("/doctor/dashboard");
          break;
        case "admin":
          navigate("/admin");
          break;
        case "patient":
        default:
          navigate("/dashboard");
          break;
      }
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
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
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-form-card">
          <span className="form-kicker">WELCOME BACK</span>
          <h2 className="form-title">Sign in to Turi</h2>
          <p className="form-subtitle">
            Choose your workspace and enter your details.
          </p>

          {error && (
            <div className="auth-error-banner">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="workspace-tabs">
            <button
              type="button"
              className={`tab-btn ${role === "patient" ? "active" : ""}`}
              onClick={() => handleRoleChange("patient")}
            >
              <span>Patient</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${role === "doctor" ? "active" : ""}`}
              onClick={() => handleRoleChange("doctor")}
            >
              <span>Doctor</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${role === "Administrator" ? "active" : ""}`}
              onClick={() => handleRoleChange("Administrator")}
            >
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
                placeholder="name@example.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
              </div>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
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

            <button
              type="submit"
              className="signin-submit-btn"
              disabled={isLoading}
            >
              <span>{isLoading ? "Signing in..." : "Sign in"}</span>
            </button>
          </form>

          <div className="register-redirect-footer">
            <span>Don't have an account? </span>
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Register here.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
