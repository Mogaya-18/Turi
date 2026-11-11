import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./DoctorDashboard.css";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appointments");

  const [doctorProfile, setDoctorProfile] = useState({
    id: null,
    fullName: "Doctor",
    specialization: "General Practice",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [inventory, setInventory] = useState([]);

  // Form states
  const [consultation, setConsultation] = useState({
    chiefComplaint: "",
    diagnosis: "",
    clinicalNotes: "",
  });

  const [prescription, setPrescription] = useState({
    medicineName: "",
    dosage: "",
    frequency: "Once daily",
    duration: "7 days",
    instructions: "",
  });

  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Doctor Profile
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      setLoadingProfile(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        let { data } = await supabase
          .from("profiles")
          .select("id, full_name, specialization")
          .eq("id", user.id)
          .maybeSingle();

        if (!data && user.email) {
          const { data: emailData } = await supabase
            .from("profiles")
            .select("id, full_name, specialization")
            .ilike("email", user.email)
            .maybeSingle();
          data = emailData;
        }

        if (data) {
          setDoctorProfile({
            id: data.id || user.id,
            fullName: data.full_name || "Doctor",
            specialization: data.specialization
              ? `${data.specialization} Specialist`
              : "General Practice",
          });
        }
      }
      setLoadingProfile(false);
    };

    fetchDoctorProfile();
  }, []);

  // 2. Fetch Doctor's Appointments
  const fetchAppointments = async () => {
    if (!doctorProfile.id) return;
    setLoadingAppointments(true);

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", doctorProfile.id)
      .order("start_time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
      if (data.length > 0 && !selectedPatient) {
        setSelectedPatient(data[0]);
      }
    }
    setLoadingAppointments(false);
  };

  useEffect(() => {
    if (doctorProfile.id) {
      fetchAppointments();
    }
  }, [doctorProfile.id]);

  // 3. Fetch Pharmacy Inventory
  useEffect(() => {
    const fetchStock = async () => {
      const { data } = await supabase.from("stock").select("*");
      if (data && data.length > 0) {
        setInventory(data);
      } else {
        // Fallback mock stock if stock table is empty
        setInventory([
          { id: 1, item_name: "Amoxicillin 500mg", quantity: 50 },
          { id: 2, item_name: "Paracetamol 500mg", quantity: 120 },
          { id: 3, item_name: "Lisinopril 10mg", quantity: 40 },
          { id: 4, item_name: "Metformin 850mg", quantity: 85 },
        ]);
      }
    };
    fetchStock();
  }, []);

  const handleStartConsultation = async (apt) => {
    setSelectedPatient(apt);
    setActiveTab("notes");

    await supabase
      .from("appointments")
      .update({ status: "In consultation" })
      .eq("id", apt.id);

    fetchAppointments();
  };

  const handleAddPrescriptionItem = (e) => {
    e.preventDefault();
    if (!prescription.medicineName) return;

    setPrescriptionsList((prev) => [
      ...prev,
      { ...prescription, id: Date.now() },
    ]);
    setPrescription({
      medicineName: "",
      dosage: "",
      frequency: "Once daily",
      duration: "7 days",
      instructions: "",
    });
  };

  const handleRemovePrescription = (id) => {
    setPrescriptionsList((prev) => prev.filter((item) => item.id !== id));
  };

  // 4. Save Consultation & Prescriptions directly to Supabase
  const handleSaveConsultation = async (issueNow = false) => {
    if (!selectedPatient) return;
    setStatusMessage("");
    setIsSaving(true);

    try {
      // Create Consultation Record
      const { data: consultData, error: consultError } = await supabase
        .from("consultations")
        .insert([
          {
            appointment_id: selectedPatient.id,
            patient_id: selectedPatient.patient_id,
            doctor_id: doctorProfile.id,
            chief_complaint: consultation.chiefComplaint,
            diagnosis: consultation.diagnosis,
            clinical_notes: consultation.clinicalNotes,
          },
        ])
        .select()
        .single();

      if (consultError) throw consultError;

      // Save Prescriptions if any exist
      if (issueNow && prescriptionsList.length > 0) {
        const rxRows = prescriptionsList.map((item) => ({
          consultation_id: consultData.id,
          patient_id: selectedPatient.patient_id,
          doctor_id: doctorProfile.id,
          medicine_name: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          instructions: item.instructions || item.duration,
          status: "Issued",
        }));

        const { error: rxError } = await supabase
          .from("prescriptions")
          .insert(rxRows);

        if (rxError) throw rxError;
      }

      // Mark Appointment as Completed
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "Completed" })
        .eq("id", selectedPatient.id);

      if (updateError) throw updateError;

      setStatusMessage(
        issueNow
          ? "Consultation completed and prescription saved successfully!"
          : "Consultation notes saved successfully!",
      );

      if (issueNow) {
        setPrescriptionsList([]);
        setConsultation({
          chiefComplaint: "",
          diagnosis: "",
          clinicalNotes: "",
        });
      }

      fetchAppointments();
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to save consultation details to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="doctor-shell">
      {/* Top Header */}
      <header className="doctor-header">
        <div className="header-brand">
          <div className="brand-badge">+</div>
          <div>
            <h1>{loadingProfile ? "Loading..." : doctorProfile.fullName}</h1>
            <span className="specialty-tag">
              {doctorProfile.specialization}
            </span>
          </div>
        </div>

        <button className="doctor-logout-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </header>

      {/* Main Container */}
      <div className="doctor-body">
        {/* Navigation Tabs */}
        <div className="doctor-tabs">
          <button
            className={`tab-link ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            Appointments Queue
          </button>
          <button
            className={`tab-link ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            Consultation & Notes
          </button>
          <button
            className={`tab-link ${activeTab === "prescriptions" ? "active" : ""}`}
            onClick={() => setActiveTab("prescriptions")}
          >
            Rx & Prescriptions ({prescriptionsList.length})
          </button>
        </div>

        {statusMessage && (
          <div className="doctor-alert-success">
            <span>✓ {statusMessage}</span>
            <button onClick={() => setStatusMessage("")}>×</button>
          </div>
        )}

        {/* --- TAB 1: APPOINTMENTS QUEUE --- */}
        {activeTab === "appointments" && (
          <div className="doctor-card">
            <div className="card-heading-row">
              <div>
                <h2>Today's Appointments</h2>
                <p>Manage scheduled patient consultations</p>
              </div>
              <span className="count-badge">{appointments.length} Total</span>
            </div>

            {loadingAppointments ? (
              <p style={{ padding: "20px", color: "#64748b" }}>
                Loading appointments...
              </p>
            ) : appointments.length === 0 ? (
              <p style={{ padding: "20px", color: "#94a3b8" }}>
                No patient appointments found for today.
              </p>
            ) : (
              <table className="doctor-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient Name</th>
                    <th>Demographics</th>
                    <th>Reason for Visit</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => {
                    const patientName = apt.created_by || "Patient";
                    const statusClass = apt.status
                      ? apt.status.toLowerCase().replace(/\s+/g, "-")
                      : "pending";

                    return (
                      <tr
                        key={apt.id}
                        className={
                          selectedPatient?.id === apt.id ? "active-row" : ""
                        }
                      >
                        <td>
                          <strong>{apt.start_time}</strong>
                        </td>
                        <td>
                          <div className="patient-name-cell">
                            <div className="avatar-circle">
                              {patientName.charAt(0).toUpperCase()}
                            </div>
                            <span>{patientName}</span>
                          </div>
                        </td>
                        <td>{apt.demographics || "N/A"}</td>
                        <td>{apt.reason_for_visit || "General Checkup"}</td>
                        <td>
                          <span className={`status-pill ${statusClass}`}>
                            {apt.status || "Confirmed"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-select-patient"
                            disabled={apt.status === "Completed"}
                            onClick={() => handleStartConsultation(apt)}
                          >
                            {apt.status === "Completed"
                              ? "Completed"
                              : "Start Consultation"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* --- TAB 2: CONSULTATION & CLINICAL NOTES --- */}
        {activeTab === "notes" && (
          <div className="consultation-grid">
            <div className="doctor-card patient-summary-card">
              <span className="card-kicker">ACTIVE PATIENT</span>
              <h3>{selectedPatient?.created_by || "No Patient Selected"}</h3>
              <p className="patient-meta">
                {selectedPatient?.demographics || "Demographics pending"}
              </p>

              <div className="visit-reason-box">
                <label>Reason for Visit</label>
                <span>
                  {selectedPatient?.reason_for_visit || "Not specified"}
                </span>
              </div>

              {appointments.length > 0 && (
                <div className="patient-switcher">
                  <label>Switch Patient:</label>
                  <select
                    value={selectedPatient?.id || ""}
                    onChange={(e) => {
                      const found = appointments.find(
                        (a) =>
                          a.id === e.target.value ||
                          a.id === Number(e.target.value),
                      );
                      if (found) setSelectedPatient(found);
                    }}
                  >
                    {appointments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.created_by} ({a.start_time})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="doctor-card notes-form-card">
              <h2>Clinical Notes & Diagnosis</h2>

              <div className="form-group">
                <label>Chief Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. Chest tightness, shortness of breath on exertion"
                  value={consultation.chiefComplaint}
                  onChange={(e) =>
                    setConsultation({
                      ...consultation,
                      chiefComplaint: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Diagnosis / Assessment</label>
                <input
                  type="text"
                  placeholder="e.g. Mild Hypertension, Essential"
                  value={consultation.diagnosis}
                  onChange={(e) =>
                    setConsultation({
                      ...consultation,
                      diagnosis: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Detailed Clinical Notes</label>
                <textarea
                  rows="6"
                  placeholder="Record patient history, physical examination findings, recommendations..."
                  value={consultation.clinicalNotes}
                  onChange={(e) =>
                    setConsultation({
                      ...consultation,
                      clinicalNotes: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setActiveTab("prescriptions")}
                >
                  Proceed to Issue Rx →
                </button>
                <button
                  className="btn-primary"
                  disabled={isSaving}
                  onClick={() => handleSaveConsultation(false)}
                >
                  {isSaving ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: ISSUE PRESCRIPTION --- */}
        {activeTab === "prescriptions" && (
          <div className="consultation-grid">
            <div className="doctor-card">
              <h2>Add Prescription Item</h2>
              <p className="card-subtitle">
                Prescribing for:{" "}
                <strong>
                  {selectedPatient?.created_by || "Selected Patient"}
                </strong>
              </p>

              <form onSubmit={handleAddPrescriptionItem} className="rx-form">
                <div className="form-group">
                  <label>Select Medication (Pharmacy Stock)</label>
                  <select
                    value={prescription.medicineName}
                    onChange={(e) =>
                      setPrescription({
                        ...prescription,
                        medicineName: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">-- Choose Medication --</option>
                    {inventory.map((med) => (
                      <option
                        key={med.id}
                        value={med.item_name || med.medicineName}
                      >
                        {med.item_name || med.medicineName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg or 1 tablet"
                      value={prescription.dosage}
                      onChange={(e) =>
                        setPrescription({
                          ...prescription,
                          dosage: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Frequency</label>
                    <select
                      value={prescription.frequency}
                      onChange={(e) =>
                        setPrescription({
                          ...prescription,
                          frequency: e.target.value,
                        })
                      }
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">
                        Three times daily
                      </option>
                      <option value="As needed (PRN)">As needed (PRN)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Instructions & Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. Take after meals with full glass of water for 7 days"
                    value={prescription.instructions}
                    onChange={(e) =>
                      setPrescription({
                        ...prescription,
                        instructions: e.target.value,
                      })
                    }
                  />
                </div>

                <button type="submit" className="btn-secondary full-width">
                  + Add to Prescription Sheet
                </button>
              </form>
            </div>

            <div className="doctor-card">
              <h2>Prescription Summary Sheet</h2>

              {prescriptionsList.length === 0 ? (
                <div className="rx-empty-state">
                  <p>No medications added to this prescription yet.</p>
                </div>
              ) : (
                <div className="rx-list">
                  {prescriptionsList.map((item, idx) => (
                    <div key={item.id} className="rx-item">
                      <div className="rx-info">
                        <h4>
                          {idx + 1}. {item.medicineName}
                        </h4>
                        <p>
                          {item.dosage} • {item.frequency}
                        </p>
                        {item.instructions && (
                          <span className="rx-note">{item.instructions}</span>
                        )}
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => handleRemovePrescription(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rx-footer-actions">
                <button
                  className="btn-primary full-width"
                  disabled={prescriptionsList.length === 0 || isSaving}
                  onClick={() => handleSaveConsultation(true)}
                >
                  {isSaving ? "Saving..." : "Finalize & Send Rx to Pharmacy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
