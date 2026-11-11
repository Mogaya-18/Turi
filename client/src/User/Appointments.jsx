import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout/Layout";
import { supabase } from "../supabaseClient";
import { DataTable, Badge } from "../Admin/components";
import "../Admin/Admin.css";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true });

    if (user) {
      query = query.eq("patient_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching appointments:", error);
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;

    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      alert("Failed to cancel appointment: " + error.message);
    } else {
      fetchAppointments();
    }
  };

  const columns = [
    { key: "doctor_name", label: "Doctor" },
    { key: "appointment_date", label: "Appointment Date" },
    { key: "start_time", label: "Start Time" },
    { key: "end_time", label: "End Time" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge tone={r.status === "Confirmed" ? "ok" : "warn"}>
          {r.status || "Confirmed"}
        </Badge>
      ),
    },
    {
      key: "a",
      label: "Actions",
      render: (r) => (
        <button className="btn danger sm" onClick={() => handleCancel(r.id)}>
          Cancel
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div
        className="admin"
        style={{
          background: "transparent",
          minHeight: "auto",
          display: "block",
        }}
      >
        {/* Header Section matching Admin style */}
        <div className="page-head" style={{ marginBottom: "28px" }}>
          <div>
            <div className="eyebrow">Patient Portal</div>
            <h1
              style={{ margin: "6px 0 0", fontSize: "32px", fontWeight: "400" }}
            >
              My Appointments
            </h1>
          </div>
          <button className="btn" onClick={() => navigate("/book-appointment")}>
            Book appointment
          </button>
        </div>

        {/* Admin Styled Table Component */}
        {loading ? (
          <p style={{ color: "var(--muted)", padding: "12px" }}>
            Loading appointments...
          </p>
        ) : (
          <DataTable
            columns={columns}
            rows={appointments}
            empty="No appointments booked yet."
          />
        )}
      </div>
    </Layout>
  );
}
