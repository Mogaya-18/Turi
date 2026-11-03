import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "patient",
    employeeCode: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Dynamic trigger for Employee Code requirement
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData((prev) => ({
      ...prev,
      role: selectedRole,
      employeeCode: selectedRole === "patient" ? "" : prev.employeeCode,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify Employee Code for Admin and Doctor roles
      if (formData.role === "admin" || formData.role === "doctor") {
        const { data: codeData, error: codeErr } = await supabase
          .from("employee_codes")
          .select("*")
          .eq("code", formData.employeeCode.trim())
          .eq("assigned_role", formData.role)
          .single();

        if (codeErr || !codeData) {
          alert(`Invalid Employee Code for the role '${formData.role}'.`);
          setLoading(false);
          return;
        }

        if (codeData.is_used) {
          alert("This Employee Code has already been used.");
          setLoading(false);
          return;
        }
      }

      // 2. Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: formData.role,
          },
        },
      });

      if (authError) {
        alert(`Registration failed: ${authError.message}`);
        setLoading(false);
        return;
      }

      // 3. Insert record into public.profiles table
      if (authData?.user) {
        // 4. Mark Employee Code as used if applicable
        if (formData.role === "admin" || formData.role === "doctor") {
          await supabase
            .from("employee_codes")
            .update({ is_used: true })
            .eq("code", formData.employeeCode.trim());
        }
      }

      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Unexpected Registration Error:", err);
      alert("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const isEmployeeRole =
    formData.role === "admin" || formData.role === "doctor";

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
      <h2>Account Registration</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          required
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          style={{ padding: "8px" }}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ padding: "8px" }}
        />

        {/* Phone */}
        <input
          type="text"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          style={{ padding: "8px" }}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          style={{ padding: "8px" }}
        />

        {/* Category Dropdown */}
        <select
          value={formData.role}
          onChange={handleRoleChange}
          required
          style={{ padding: "8px" }}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>

        {/* Employee Code Input */}
        <input
          type="text"
          placeholder={
            isEmployeeRole ? "Enter Employee Code" : "N/A for Patients"
          }
          disabled={!isEmployeeRole}
          required={isEmployeeRole}
          value={formData.employeeCode}
          onChange={(e) =>
            setFormData({ ...formData, employeeCode: e.target.value })
          }
          style={{
            padding: "8px",
            backgroundColor: isEmployeeRole ? "#ffffff" : "#e9ecef",
            cursor: isEmployeeRole ? "text" : "not-allowed",
          }}
        />

        {/* Submit */}
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
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Already have an account? <a href="/login">Log in here</a>.
      </p>
    </div>
  );
}
