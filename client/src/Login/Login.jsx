import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        alert(`Login failed: ${authError.message}`);
        setLoading(false);
        return;
      }

      // 2. Fetch User Profile & Role from 'profiles' table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        alert("Could not retrieve user role from database.");
        setLoading(false);
        return;
      }

      alert(`Welcome back, ${profile.full_name}!`);

      // 3. Route user based on their assigned DB role
      if (profile.role === "admin") {
        navigate("/admin");
      } else if (profile.role === "doctor") {
        navigate("/consultation");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      alert("An error occurred while logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h2>Turi Login</h2>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            backgroundColor: "#2b5876",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>
        New patient? <a href="/register">Register here</a>.
      </p>
    </div>
  );
}
