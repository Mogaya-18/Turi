import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  // Views: "login" | "forgot" | "reset"
  const [view, setView] = useState("login");

  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Detect Supabase PASSWORD_RECOVERY redirect event when user opens reset email link
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setError("");
        setSuccessMsg("");
        setView("reset");
      }
    });

    if (window.location.hash.includes("type=recovery")) {
      setView("reset");
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const switchView = (nextView) => {
    setView(nextView);
    setError("");
    setSuccessMsg("");
    setShowPassword(false);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
  };

  // 1. Standard Sign In
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: email.trim().toLowerCase(),
          password,
        },
      );

      if (authError) throw authError;

      const user = data.user;

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

      if (normalizedSelected !== normalizedAssigned) {
        await supabase.auth.signOut();
        throw new Error(
          `Access denied. Your account is registered as a ${assignedRole.toUpperCase()}, not a ${selectedRole.toUpperCase()}.`,
        );
      }

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

  // 2. Send Password Reset Link via Email
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: `${window.location.origin}/login`,
        },
      );

      if (resetError) throw resetError;

      setSuccessMsg(
        `Password reset link sent to ${cleanEmail}. Check your inbox (and spam folder) to set a new password.`,
      );
    } catch (err) {
      setError(err.message || "Unable to send password reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Save New Password After Clicking Recovery Link
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      await supabase.auth.signOut();
      setNewPassword("");
      setConfirmPassword("");
      setPassword("");
      setView("login");
      setSuccessMsg(
        "Your password has been updated. Please sign in with your new password.",
      );
    } catch (err) {
      setError(err.message || "Failed to update password.");
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
          {view === "login" && (
            <>
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
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="auth-success-banner">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{successMsg}</span>
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

              <form onSubmit={handleLoginSubmit} className="auth-form">
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
                    <button
                      type="button"
                      className="forgot-link-btn"
                      onClick={() => switchView("forgot")}
                    >
                      Forgot password?
                    </button>
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
            </>
          )}

          {view === "forgot" && (
            <>
              <span className="form-kicker">ACCOUNT RECOVERY</span>
              <h2 className="form-title">Reset password</h2>
              <p className="form-subtitle">
                Enter your email address and we'll send you a link to reset your
                password.
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
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="auth-success-banner">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="auth-form">
                <div className="input-group">
                  <label>Registered email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="signin-submit-btn"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading ? "Sending reset link..." : "Send reset link"}
                  </span>
                </button>
              </form>

              <div className="register-redirect-footer">
                <span>Remembered your password? </span>
                <button
                  type="button"
                  className="forgot-link-btn"
                  onClick={() => switchView("login")}
                >
                  Back to Sign in
                </button>
              </div>
            </>
          )}

          {view === "reset" && (
            <>
              <span className="form-kicker">SECURITY UPDATE</span>
              <h2 className="form-title">Set new password</h2>
              <p className="form-subtitle">
                Enter and confirm your new password below.
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
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="auth-form">
                <div className="input-group">
                  <label>New password</label>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
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

                <div className="input-group">
                  <label>Confirm new password</label>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="signin-submit-btn"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading ? "Updating password..." : "Update password"}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
