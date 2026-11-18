import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout/Layout";
import { supabase } from "../supabaseClient";
import "./Consultation.css";

export default function Consultation() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientConsultations = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Fetch all consultations for the logged-in patient (newest first)
      const { data: consultData, error } = await supabase
        .from("consultations")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !consultData || consultData.length === 0) {
        setConsultations([]);
        setLoading(false);
        return;
      }

      // Deduplicate by appointment_id (keeps the newest consultation record per visit)
      const uniqueConsultData = [];
      const seenAppointments = new Set();
      for (const item of consultData) {
        if (item.appointment_id && seenAppointments.has(item.appointment_id)) {
          continue;
        }
        if (item.appointment_id) {
          seenAppointments.add(item.appointment_id);
        }
        uniqueConsultData.push(item);
      }

      // 2. Fetch prescriptions linked to this patient
      const { data: rxData } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: true });

      // 3. Fetch doctor profiles & appointments to display doctor name, specialty, and visit date
      const doctorIds = [
        ...new Set(uniqueConsultData.map((c) => c.doctor_id).filter(Boolean)),
      ];
      const appointmentIds = [
        ...new Set(
          uniqueConsultData.map((c) => c.appointment_id).filter(Boolean),
        ),
      ];

      let doctorsMap = {};
      if (doctorIds.length > 0) {
        const { data: docs } = await supabase
          .from("profiles")
          .select("id, full_name, specialization")
          .in("id", doctorIds);

        if (docs) {
          docs.forEach((d) => {
            doctorsMap[d.id] = d;
          });
        }
      }

      let appointmentsMap = {};
      if (appointmentIds.length > 0) {
        const { data: appts } = await supabase
          .from("appointments")
          .select("id, appointment_date, start_time, doctor_name")
          .in("id", appointmentIds);

        if (appts) {
          appts.forEach((a) => {
            appointmentsMap[a.id] = a;
          });
        }
      }

      // 4. Combine consultation records with their matching prescriptions and doctor metadata
      const enriched = uniqueConsultData.map((c) => {
        const doc = doctorsMap[c.doctor_id] || {};
        const appt = appointmentsMap[c.appointment_id] || {};

        // Match prescriptions by consultation_id or any duplicate consultation for the same appointment
        const relatedConsultationIds = consultData
          .filter((item) => item.appointment_id === c.appointment_id)
          .map((item) => item.id);

        const matchingRx = (rxData || []).filter((rx) =>
          relatedConsultationIds.includes(rx.consultation_id),
        );

        return {
          ...c,
          doctorName: doc.full_name || appt.doctor_name || "Attending Doctor",
          specialization: doc.specialization
            ? `${doc.specialization} Specialist`
            : "General Consultation",
          visitDate:
            appt.appointment_date ||
            new Date(c.created_at).toLocaleDateString(),
          visitTime: appt.start_time || "",
          prescriptions: matchingRx,
        };
      });

      setConsultations(enriched);
      setSelectedIndex(0);
      setLoading(false);
    };

    fetchPatientConsultations();
  }, []);

  const activeConsultation = consultations[selectedIndex] || null;

  return (
    <Layout>
      <div className="consultation-container">
        {/* Header Section */}
        <div className="consultation-header">
          <div>
            <span className="consultation-eyebrow">PATIENT PORTAL</span>
            <h1 className="consultation-title">Consultation & Prescriptions</h1>
            {activeConsultation && (
              <p className="consultation-subtitle">
                {activeConsultation.doctorName} •{" "}
                {activeConsultation.specialization}
              </p>
            )}
          </div>

          {consultations.length > 1 && (
            <div className="consultation-switcher">
              <label htmlFor="visit-select">Select Visit:</label>
              <select
                id="visit-select"
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
              >
                {consultations.map((c, idx) => (
                  <option key={c.id} value={idx}>
                    {c.visitDate}
                    {c.visitTime ? ` (${c.visitTime})` : ""} — {c.doctorName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="consultation-card">
            <p style={{ color: "#64748b", margin: 0 }}>
              Loading consultation records...
            </p>
          </div>
        ) : !activeConsultation ? (
          <div className="consultation-card consultation-empty-card">
            <h3>No consultation records yet</h3>
            <p>
              Once a doctor completes your consultation and issues clinical
              notes or prescriptions, they will appear here.
            </p>
            <button
              className="btn-book-visit"
              onClick={() => navigate("/book-appointment")}
            >
              Book an appointment
            </button>
          </div>
        ) : (
          <div className="consultation-widgets-grid">
            {/* Left Widget: Clinical Notes & Diagnosis */}
            <div className="consultation-card">
              <div className="card-top-meta">
                <div>
                  <span className="card-kicker">VISIT SUMMARY</span>
                  <h2>Clinical Notes & Diagnosis</h2>
                </div>
                <span className="visit-date-badge">
                  {activeConsultation.visitDate}
                  {activeConsultation.visitTime
                    ? ` • ${activeConsultation.visitTime}`
                    : ""}
                </span>
              </div>

              <div className="clinical-field-block">
                <label>CHIEF COMPLAINT</label>
                <div className="clinical-value-box">
                  {activeConsultation.chief_complaint || "Not recorded"}
                </div>
              </div>

              <div className="clinical-field-block">
                <label>DIAGNOSIS / ASSESSMENT</label>
                <div className="clinical-value-box">
                  {activeConsultation.diagnosis || "Not recorded"}
                </div>
              </div>

              <div className="clinical-field-block">
                <label>DETAILED CLINICAL NOTES</label>
                <div className="clinical-value-box notes-multiline">
                  {activeConsultation.clinical_notes ||
                    "No additional clinical notes recorded for this visit."}
                </div>
              </div>
            </div>

            {/* Right Widget: Prescription Summary Sheet (Matches Doctor Rx Widget Design) */}
            <div className="consultation-card">
              <div className="card-top-meta">
                <div>
                  <span className="card-kicker">ISSUED MEDICATION</span>
                  <h2>Prescription Summary Sheet</h2>
                </div>
                <span className="rx-count-pill">
                  {activeConsultation.prescriptions.length}{" "}
                  {activeConsultation.prescriptions.length === 1
                    ? "Item"
                    : "Items"}
                </span>
              </div>

              {activeConsultation.prescriptions.length === 0 ? (
                <div className="rx-empty-state">
                  <p>
                    No medications were prescribed during this consultation.
                  </p>
                </div>
              ) : (
                <div className="rx-list">
                  {activeConsultation.prescriptions.map((item, idx) => (
                    <div key={item.id} className="rx-item">
                      <div className="rx-info">
                        <h4>
                          {idx + 1}. {item.medicine_name}
                        </h4>
                        <p>
                          {item.dosage} • {item.frequency}
                        </p>
                        {item.instructions && (
                          <span className="rx-note">{item.instructions}</span>
                        )}
                      </div>
                      <span className="rx-status-tag">
                        {item.status || "Issued"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
