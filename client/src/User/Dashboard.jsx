import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout/Layout";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatMonthDay(dateStr) {
  if (!dateStr) return { day: "—", month: "TBD" };
  const parts = String(dateStr).split("-");
  if (parts.length === 3) {
    const d = new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
    );
    return {
      day: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    };
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return { day: "—", month: "TBD" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
  };
}

function getBpContext(sys, dia) {
  if (!sys || !dia) return { text: "No reading yet", tone: "" };
  if (sys >= 140 || dia >= 90) return { text: "High range", tone: "bad" };
  if (sys >= 120 || dia >= 80) return { text: "Elevated range", tone: "warn" };
  return { text: "Normal range", tone: "ok" };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Patient");
  const [loading, setLoading] = useState(true);

  const [nextAppt, setNextAppt] = useState(null);
  const [careDoctor, setCareDoctor] = useState(null);
  const [latestVital, setLatestVital] = useState(null);
  const [activeRxCount, setActiveRxCount] = useState(0);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadOverviewData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Fetch Patient Profile
      let { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileData && user.email) {
        const { data: emailMatch } = await supabase
          .from("profiles")
          .select("full_name")
          .ilike("email", user.email)
          .maybeSingle();
        profileData = emailMatch;
      }

      if (profileData?.full_name) {
        setUserName(profileData.full_name.trim().split(" ")[0]);
      }

      // 2. Fetch Live Patient Data in Parallel
      const [
        { data: appts },
        { data: doctors },
        { data: vitals },
        { data: passport },
        { data: prescriptions },
        { data: unpaidInvoices },
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", user.id)
          .order("appointment_date", { ascending: true }),
        supabase
          .from("profiles")
          .select("id, full_name, specialization")
          .eq("role", "doctor"),
        supabase
          .from("patient_vitals")
          .select("*")
          .eq("patient_id", user.id)
          .order("recorded_date", { ascending: false })
          .limit(1),
        supabase
          .from("patient_health_profiles")
          .select("*")
          .eq("patient_id", user.id)
          .maybeSingle(),
        supabase
          .from("prescriptions")
          .select("id, medicine_name, created_at")
          .eq("patient_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("id, invoice_number, total_amount, status")
          .eq("patient_id", user.id)
          .eq("status", "UNPAID"),
      ]);

      // Pick nearest upcoming active appointment, or fall back to most recent appointment
      const activeAppts = (appts || []).filter(
        (a) => a.status !== "Completed" && a.status !== "Cancelled",
      );
      const chosenAppt =
        activeAppts.length > 0
          ? activeAppts[0]
          : appts && appts.length > 0
            ? appts[appts.length - 1]
            : null;
      setNextAppt(chosenAppt);

      // Match Care Team doctor from chosen appointment or clinic roster
      const docList = doctors || [];
      let matchedDoc = null;
      if (chosenAppt) {
        matchedDoc = docList.find(
          (d) =>
            d.id === chosenAppt.doctor_id ||
            d.full_name === chosenAppt.doctor_name,
        ) || {
          full_name: chosenAppt.doctor_name || "Attending Physician",
          specialization: "Primary Care",
        };
      } else if (docList.length > 0) {
        matchedDoc = docList[0];
      }
      setCareDoctor(matchedDoc);

      // Latest Vitals & Active Rx Count
      setLatestVital(vitals && vitals.length > 0 ? vitals[0] : null);
      setActiveRxCount((prescriptions || []).length);

      // Build Dynamic "For you" Actionable Tasks
      const dynamicTasks = [];

      (unpaidInvoices || []).forEach((inv) => {
        dynamicTasks.push({
          id: `inv-${inv.id}`,
          title: `Settle pending invoice #${inv.invoice_number}`,
          subtitle: `KES ${Number(inv.total_amount || 0).toLocaleString("en-KE")} due • Tap to pay via M-Pesa`,
          route: "/invoices",
          urgent: true,
        });
      });

      if (
        !passport ||
        !passport.blood_group ||
        passport.blood_group === "Not recorded" ||
        !passport.emergency_contact
      ) {
        dynamicTasks.push({
          id: "passport-incomplete",
          title: "Complete your Medical Passport & Allergies",
          subtitle: "Add blood group & emergency contact for safer care",
          route: "/records",
          urgent: false,
        });
      }

      if (!vitals || vitals.length === 0) {
        dynamicTasks.push({
          id: "log-first-vital",
          title: "Log your baseline blood pressure & pulse",
          subtitle: "Takes less than 1 minute in Health records",
          route: "/records",
          urgent: false,
        });
      }

      if (prescriptions && prescriptions.length > 0) {
        dynamicTasks.push({
          id: "review-rx",
          title: `Review ${prescriptions.length} prescribed medication${prescriptions.length > 1 ? "s" : ""}`,
          subtitle: `Latest: ${prescriptions[0].medicine_name}`,
          route: "/consultation",
          urgent: false,
        });
      }

      setTasks(dynamicTasks);
      setLoading(false);
    };

    loadOverviewData();
  }, []);

  const dateBadge = formatMonthDay(nextAppt?.appointment_date);
  const bpStatus = getBpContext(latestVital?.systolic, latestVital?.diastolic);

  return (
    <Layout>
      {/* Dynamic Welcome Header Section */}
      <div className="dashboard-header">
        <div className="header-text">
          <span className="subtitle-green">YOUR CARE, ALL IN ONE PLACE</span>
          <h1 className="greeting-title">
            {getTimeGreeting()}, {userName}.
          </h1>
          <p className="greeting-sub">
            Here's what's happening with your care.
          </p>
        </div>
        <button
          className="book-appt-btn"
          onClick={() => navigate("/book-appointment")}
        >
          Book appointment
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        {/* Card 1: Next Appointment */}
        <div className="dash-card next-appt-card">
          <div className="card-top">
            <span className="card-kicker">
              {nextAppt?.status === "Completed"
                ? "RECENT VISIT"
                : "NEXT APPOINTMENT"}
            </span>
            <span className="status-badge">
              {loading ? "Loading..." : nextAppt?.status || "No visits yet"}
            </span>
          </div>

          {loading ? (
            <h2 className="appt-title">Checking your schedule...</h2>
          ) : nextAppt ? (
            <>
              <h2 className="appt-title">
                Consultation with {nextAppt.doctor_name || "Doctor"}
              </h2>

              <div className="appt-details-box">
                <div className="date-block">
                  <span className="date-day">{dateBadge.day}</span>
                  <span className="date-month">{dateBadge.month}</span>
                </div>

                <div className="time-block">
                  <div className="info-row">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#007a5a"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>
                      {nextAppt.start_time}
                      {nextAppt.end_time ? `–${nextAppt.end_time}` : ""}
                    </span>
                  </div>
                  <div className="info-row">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#007a5a"
                      strokeWidth="2"
                    >
                      <path d="M23 7l-7 5 7 5V7z"></path>
                      <rect
                        x="1"
                        y="5"
                        width="15"
                        height="14"
                        rx="2"
                        ry="2"
                      ></rect>
                    </svg>
                    <span>
                      {nextAppt.reason_for_visit || "Clinical consultation"}
                    </span>
                  </div>
                </div>

                <button
                  className="join-visit-btn"
                  onClick={() => navigate("/consultation")}
                >
                  {nextAppt.status === "Completed"
                    ? "View notes"
                    : "Open visit"}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="appt-details-box">
              <div className="time-block">
                <div className="info-row">
                  <span>
                    You have no scheduled consultations yet. Book an appointment
                    to get started.
                  </span>
                </div>
              </div>
              <button
                className="join-visit-btn"
                onClick={() => navigate("/book-appointment")}
              >
                Schedule now
              </button>
            </div>
          )}
        </div>

        {/* Card 2: Your Care Team */}
        <div className="dash-card care-team-card">
          <div className="card-top">
            <h3>Your care team</h3>
            <span
              className="text-link"
              onClick={() => navigate("/appointments")}
            >
              View all
            </span>
          </div>

          {careDoctor ? (
            <div className="provider-profile">
              <div className="provider-initials-avatar">
                {careDoctor.full_name
                  .replace(/^Dr\.\s*/i, "")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="provider-info">
                <h4>{careDoctor.full_name}</h4>
                <p className="provider-role">
                  {careDoctor.specialization
                    ? `${careDoctor.specialization} Specialist`
                    : "Primary care physician"}
                </p>
                <div className="provider-status">
                  <span className="status-dot"></span>
                  <span>Available for consultations</span>
                </div>
              </div>
              <button
                className="message-btn"
                title="Message doctor"
                onClick={() => navigate("/messages")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#007a5a"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>
          ) : (
            <p className="greeting-sub">No assigned provider yet.</p>
          )}
        </div>

        {/* Card 3: Health Snapshot */}
        <div className="dash-card health-snapshot-card">
          <div className="card-top">
            <h3>Health snapshot</h3>
            <span className="text-link" onClick={() => navigate("/records")}>
              View records
            </span>
          </div>

          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Blood pressure</span>
              <div className="metric-value">
                {latestVital?.systolic && latestVital?.diastolic
                  ? `${latestVital.systolic}/${latestVital.diastolic}`
                  : "—/—"}
              </div>
              <span className={`metric-context ${bpStatus.tone}`}>
                {bpStatus.text}
              </span>
            </div>
            <div className="metric-divider"></div>

            <div className="metric-item">
              <span className="metric-label">Resting heart rate</span>
              <div className="metric-value">
                {latestVital?.heart_rate ? (
                  <>
                    {latestVital.heart_rate} <span className="unit">bpm</span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <span className="metric-context">
                {latestVital?.recorded_date
                  ? `Updated ${latestVital.recorded_date}`
                  : "Log in Health records"}
              </span>
            </div>
            <div className="metric-divider"></div>

            <div className="metric-item">
              <span className="metric-label">Prescriptions</span>
              <div className="metric-value">
                {activeRxCount}{" "}
                <span className="unit">
                  {activeRxCount === 1 ? "item" : "items"}
                </span>
              </div>
              <span className="metric-context">Issued by doctors</span>
            </div>
          </div>
        </div>

        {/* Card 4: For You (Live Actionable Tasks) */}
        <div className="dash-card tasks-card">
          <div className="card-top">
            <h3>For you</h3>
            <span className="item-count">
              {tasks.length} {tasks.length === 1 ? "item" : "items"}
            </span>
          </div>

          {tasks.length === 0 ? (
            <p className="greeting-sub">
              All caught up! No pending actions on your account.
            </p>
          ) : (
            <div className="task-list">
              {tasks.map((task, idx) => (
                <React.Fragment key={task.id}>
                  {idx > 0 && <hr className="task-divider" />}
                  <div
                    className="task-item clickable"
                    onClick={() => navigate(task.route)}
                  >
                    <span
                      className={`task-indicator ${task.urgent ? "urgent" : ""}`}
                    >
                      {task.urgent ? "!" : "→"}
                    </span>
                    <div className="task-text">
                      <h4>{task.title}</h4>
                      <p>{task.subtitle}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
