import React, { useState, useEffect } from "react";
import Layout from "./Layout/Layout";
import { supabase } from "../supabaseClient";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    blood_type: "",
    allergies: "",
    emergency_contact: "",
  });

  // Fetch logged-in user profile or fallback to first patient row
  const fetchProfile = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase.from("profiles").select("*");
    if (user) {
      query = query.eq("id", user.id);
    } else {
      query = query.eq("role", "patient").limit(1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading profile:", error);
    } else if (data && data.length > 0) {
      const p = data[0];
      setProfile(p);
      setFormData({
        full_name: p.full_name || "",
        email: p.email || "",
        phone: p.phone || "",
        date_of_birth: p.date_of_birth || "",
        blood_type: p.blood_type || "",
        allergies: p.allergies || "",
        emergency_contact: p.emergency_contact || "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;

    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", profile.id);

    if (error) {
      alert("Failed to update profile: " + error.message);
    } else {
      setIsEditing(false);
      fetchProfile();
    }
  };

  if (loading) {
    return (
      <Layout>
        <p style={{ padding: "24px" }}>Loading profile...</p>
      </Layout>
    );
  }

  const getInitials = (name) => {
    if (!name) return "PT";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div style={{ maxWidth: "900px", width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                margin: "0 0 6px 0",
                fontWeight: "500",
              }}
            >
              Patient Profile
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Manage your personal information and health details
            </p>
          </div>
          <button
            className="book-appt-btn"
            style={{ borderRadius: "30px", padding: "10px 24px" }}
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="dash-card" style={{ padding: "32px" }}>
          {/* Avatar & Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div
              className="user-avatar"
              style={{ width: "64px", height: "64px", fontSize: "22px" }}
            >
              {getInitials(profile?.full_name)}
            </div>
            <div>
              <h2
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "22px",
                  fontWeight: "500",
                }}
              >
                {profile?.full_name || "Patient"}
              </h2>
              <span className="status-badge" style={{ fontSize: "12px" }}>
                Patient ID: #{profile?.id ? profile.id.slice(0, 7) : "PR-4092"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Personal Details */}
            <h4
              style={{
                color: "#007a5a",
                fontSize: "12px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              PERSONAL DETAILS
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  FULL NAME
                </label>
                <input
                  name="full_name"
                  disabled={!isEditing}
                  value={formData.full_name}
                  onChange={handleChange}
                  className="field"
                  style={{ background: isEditing ? "#fff" : "#f8f9fa" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  name="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={handleChange}
                  className="field"
                  style={{ background: isEditing ? "#fff" : "#f8f9fa" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  PHONE NUMBER
                </label>
                <input
                  name="phone"
                  disabled={!isEditing}
                  placeholder="+1 (555) 234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="field"
                  style={{ background: isEditing ? "#fff" : "#f8f9fa" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  DATE OF BIRTH
                </label>
                <input
                  name="date_of_birth"
                  type="date"
                  disabled={!isEditing}
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="field"
                  style={{ background: isEditing ? "#fff" : "#f8f9fa" }}
                />
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #f0f0f0",
                margin: "24px 0",
              }}
            />

            {/* Medical Information */}
            <h4
              style={{
                color: "#007a5a",
                fontSize: "12px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              MEDICAL INFORMATION
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  BLOOD TYPE
                </label>
                <input
                  name="blood_type"
                  disabled={!isEditing}
                  placeholder="A+"
                  value={formData.blood_type}
                  onChange={handleChange}
                  className="field"
                  style={{ background: isEditing ? "#fff" : "#f8f9fa" }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  KNOWN ALLERGIES
                </label>
                <input
                  name="allergies"
                  disabled={!isEditing}
                  placeholder="Penicillin, Peanuts"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="field"
                  style={{ background: isEditing ? "#fff" : "#f8f9fa" }}
                />
              </div>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #f0f0f0",
                margin: "24px 0",
              }}
            />

            {/* Emergency Contact */}
            <h4
              style={{
                color: "#007a5a",
                fontSize: "12px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              EMERGENCY CONTACT
            </h4>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: "600",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                CONTACT INFO
              </label>
              <input
                name="emergency_contact"
                disabled={!isEditing}
                placeholder="John Hart (Spouse) - +1 (555) 987-6543"
                value={formData.emergency_contact}
                onChange={handleChange}
                className="field"
                style={{ background: isEditing ? "#fff" : "#f8f9fa" }}
              />
            </div>

            {isEditing && (
              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="confirm-btn"
                  style={{ flex: "none" }}
                >
                  Save profile
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
