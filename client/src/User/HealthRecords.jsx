import React, { useState, useEffect, useCallback } from "react";
import Layout from "./Layout/Layout";
import { supabase } from "../supabaseClient";
import "./HealthRecords.css";

function getBpStatus(sys, dia) {
  if (!sys || !dia) return { label: "Recorded", tone: "normal" };
  if (sys >= 140 || dia >= 90) return { label: "High BP", tone: "high" };
  if (sys >= 120 || dia >= 80) return { label: "Elevated", tone: "elevated" };
  return { label: "Normal", tone: "normal" };
}

export default function HealthRecords() {
  const [userId, setUserId] = useState(null);
  const [patientName, setPatientName] = useState("Patient");
  const [loading, setLoading] = useState(true);

  // Medical Passport State
  const [healthProfile, setHealthProfile] = useState({
    blood_group: "Not recorded",
    allergies: "None known",
    chronic_conditions: "None recorded",
    emergency_contact: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(healthProfile);
  const [savingProfile, setSavingProfile] = useState(false);

  // Vitals Tracker State
  const [vitals, setVitals] = useState([]);
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [vitalForm, setVitalForm] = useState({
    recorded_date: new Date().toISOString().split("T")[0],
    systolic: "",
    diastolic: "",
    heart_rate: "",
    weight_kg: "",
    glucose_mmol: "",
    notes: "",
  });
  const [savingVital, setSavingVital] = useState(false);

  // Longitudinal Diagnoses & Medications State
  const [diagnoses, setDiagnoses] = useState([]);
  const [medications, setMedications] = useState([]);
  const [historySearch, setHistorySearch] = useState("");

  const loadHealthRecords = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const [
      { data: profileData },
      { data: passportData },
      { data: vitalsData },
      { data: consultData },
      { data: rxData },
      { data: doctorProfiles },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("patient_health_profiles")
        .select("*")
        .eq("patient_id", user.id)
        .maybeSingle(),
      supabase
        .from("patient_vitals")
        .select("*")
        .eq("patient_id", user.id)
        .order("recorded_date", { ascending: false }),
      supabase
        .from("consultations")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name").eq("role", "doctor"),
    ]);

    if (profileData?.full_name) {
      setPatientName(profileData.full_name);
    }

    if (passportData) {
      const loaded = {
        blood_group: passportData.blood_group || "Not recorded",
        allergies: passportData.allergies || "None known",
        chronic_conditions: passportData.chronic_conditions || "None recorded",
        emergency_contact: passportData.emergency_contact || "",
      };
      setHealthProfile(loaded);
      setProfileForm(loaded);
    }

    setVitals(vitalsData || []);

    // Map doctor IDs to names
    const docMap = {};
    (doctorProfiles || []).forEach((d) => {
      docMap[d.id] = d.full_name;
    });

    // Deduplicate consultations by appointment_id
    const seenAppts = new Set();
    const uniqueConsults = [];
    (consultData || []).forEach((c) => {
      if (c.appointment_id && seenAppts.has(c.appointment_id)) return;
      if (c.appointment_id) seenAppts.add(c.appointment_id);
      uniqueConsults.push({
        ...c,
        doctorName: docMap[c.doctor_id] || "Attending Doctor",
        dateStr: new Date(c.created_at).toLocaleDateString(),
      });
    });
    setDiagnoses(uniqueConsults);

    const enrichedRx = (rxData || []).map((rx) => ({
      ...rx,
      doctorName: docMap[rx.doctor_id] || "Attending Doctor",
      dateStr: new Date(rx.created_at).toLocaleDateString(),
    }));
    setMedications(enrichedRx);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadHealthRecords();
  }, [loadHealthRecords]);

  // Save Medical Passport
  const handleSavePassport = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setSavingProfile(true);

    const { error } = await supabase.from("patient_health_profiles").upsert(
      [
        {
          patient_id: userId,
          blood_group: profileForm.blood_group,
          allergies: profileForm.allergies,
          chronic_conditions: profileForm.chronic_conditions,
          emergency_contact: profileForm.emergency_contact,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "patient_id" },
    );

    if (!error) {
      setHealthProfile(profileForm);
      setEditingProfile(false);
    } else {
      alert("Could not save medical profile: " + error.message);
    }
    setSavingProfile(false);
  };

  // Log New Vitals Entry
  const handleAddVital = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setSavingVital(true);

    const payload = {
      patient_id: userId,
      recorded_date: vitalForm.recorded_date,
      systolic: vitalForm.systolic ? Number(vitalForm.systolic) : null,
      diastolic: vitalForm.diastolic ? Number(vitalForm.diastolic) : null,
      heart_rate: vitalForm.heart_rate ? Number(vitalForm.heart_rate) : null,
      weight_kg: vitalForm.weight_kg ? Number(vitalForm.weight_kg) : null,
      glucose_mmol: vitalForm.glucose_mmol
        ? Number(vitalForm.glucose_mmol)
        : null,
      notes: vitalForm.notes,
    };

    const { error } = await supabase.from("patient_vitals").insert([payload]);

    if (!error) {
      setShowVitalForm(false);
      setVitalForm({
        recorded_date: new Date().toISOString().split("T")[0],
        systolic: "",
        diastolic: "",
        heart_rate: "",
        weight_kg: "",
        glucose_mmol: "",
        notes: "",
      });
      loadHealthRecords();
    } else {
      alert("Could not save vitals: " + error.message);
    }
    setSavingVital(false);
  };

  const handleDeleteVital = async (id) => {
    const { error } = await supabase
      .from("patient_vitals")
      .delete()
      .eq("id", id);
    if (!error) {
      setVitals((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const filteredDiagnoses = diagnoses.filter((d) =>
    [d.diagnosis, d.chief_complaint, d.doctorName, d.clinical_notes]
      .join(" ")
      .toLowerCase()
      .includes(historySearch.toLowerCase()),
  );

  const filteredMeds = medications.filter((m) =>
    [m.medicine_name, m.dosage, m.frequency, m.doctorName]
      .join(" ")
      .toLowerCase()
      .includes(historySearch.toLowerCase()),
  );

  return (
    <Layout>
      <div className="ehr-container">
        {/* Print-Only Header */}
        <div className="print-only-header">
          <strong>+ Turi. Healthcare</strong>
          <span>
            Official Patient Health Summary • {patientName} •{" "}
            {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* Top Page Header */}
        <div className="ehr-header">
          <div>
            <span className="ehr-eyebrow">PATIENT PORTAL</span>
            <h1 className="ehr-title">Health Records & Medical Passport</h1>
            <p className="ehr-subtitle">
              Longitudinal clinical history, allergies, vitals log, and active
              medications for {patientName}.
            </p>
          </div>

          <div className="ehr-header-actions">
            <button className="ehr-btn-outline" onClick={() => window.print()}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Export / Print EHR
            </button>
          </div>
        </div>

        {loading ? (
          <div className="ehr-card">
            <p style={{ color: "#64748b", margin: 0 }}>
              Loading your health records...
            </p>
          </div>
        ) : (
          <>
            {/* 1. Patient Medical Passport & Allergies */}
            <div className="ehr-card">
              <div className="ehr-card-head">
                <div>
                  <span className="ehr-card-kicker">MEDICAL PASSPORT</span>
                  <h2>Allergies, Blood Group & Baseline Conditions</h2>
                </div>
                {!editingProfile && (
                  <button
                    className="ehr-btn-outline"
                    onClick={() => {
                      setProfileForm(healthProfile);
                      setEditingProfile(true);
                    }}
                  >
                    Edit Medical Info
                  </button>
                )}
              </div>

              {editingProfile ? (
                <form onSubmit={handleSavePassport}>
                  <div className="ehr-form-grid">
                    <div className="ehr-field">
                      <label>Blood Group</label>
                      <select
                        className="ehr-input"
                        value={profileForm.blood_group}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            blood_group: e.target.value,
                          })
                        }
                      >
                        <option value="Not recorded">Not recorded</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="ehr-field">
                      <label>Known Allergies</label>
                      <input
                        type="text"
                        className="ehr-input"
                        placeholder="e.g. Penicillin, Peanuts, None"
                        value={profileForm.allergies}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            allergies: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="ehr-field">
                      <label>Chronic Conditions</label>
                      <input
                        type="text"
                        className="ehr-input"
                        placeholder="e.g. Mild Hypertension, Asthma"
                        value={profileForm.chronic_conditions}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            chronic_conditions: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="ehr-field">
                      <label>Emergency Contact</label>
                      <input
                        type="text"
                        className="ehr-input"
                        placeholder="Name & Phone Number"
                        value={profileForm.emergency_contact}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            emergency_contact: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="ehr-form-actions">
                    <button
                      type="button"
                      className="ehr-btn-outline"
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ehr-btn-primary"
                      disabled={savingProfile}
                    >
                      {savingProfile ? "Saving..." : "Save Medical Profile"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="passport-grid">
                  <div className="passport-item">
                    <label>Blood Group</label>
                    <span>{healthProfile.blood_group}</span>
                  </div>
                  <div className="passport-item allergy-alert">
                    <label>Known Allergies</label>
                    <span>{healthProfile.allergies}</span>
                  </div>
                  <div className="passport-item">
                    <label>Chronic Conditions</label>
                    <span>{healthProfile.chronic_conditions}</span>
                  </div>
                  <div className="passport-item">
                    <label>Emergency Contact</label>
                    <span>{healthProfile.emergency_contact || "Not set"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Vitals & Health Metrics Tracker */}
            <div className="ehr-card">
              <div className="ehr-card-head">
                <div>
                  <span className="ehr-card-kicker">VITALS MONITORING</span>
                  <h2>Blood Pressure, Heart Rate & Weight Log</h2>
                </div>
                <button
                  className="ehr-btn-primary"
                  onClick={() => setShowVitalForm((prev) => !prev)}
                >
                  {showVitalForm ? "Close Form" : "+ Log Vitals"}
                </button>
              </div>

              {showVitalForm && (
                <form
                  onSubmit={handleAddVital}
                  style={{
                    marginBottom: "20px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <div className="ehr-form-grid">
                    <div className="ehr-field">
                      <label>Date</label>
                      <input
                        type="date"
                        className="ehr-input"
                        value={vitalForm.recorded_date}
                        onChange={(e) =>
                          setVitalForm({
                            ...vitalForm,
                            recorded_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="ehr-field">
                      <label>Systolic BP (mmHg)</label>
                      <input
                        type="number"
                        className="ehr-input"
                        placeholder="e.g. 120"
                        value={vitalForm.systolic}
                        onChange={(e) =>
                          setVitalForm({
                            ...vitalForm,
                            systolic: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ehr-field">
                      <label>Diastolic BP (mmHg)</label>
                      <input
                        type="number"
                        className="ehr-input"
                        placeholder="e.g. 80"
                        value={vitalForm.diastolic}
                        onChange={(e) =>
                          setVitalForm({
                            ...vitalForm,
                            diastolic: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ehr-field">
                      <label>Heart Rate (bpm)</label>
                      <input
                        type="number"
                        className="ehr-input"
                        placeholder="e.g. 72"
                        value={vitalForm.heart_rate}
                        onChange={(e) =>
                          setVitalForm({
                            ...vitalForm,
                            heart_rate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ehr-field">
                      <label>Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="ehr-input"
                        placeholder="e.g. 68.5"
                        value={vitalForm.weight_kg}
                        onChange={(e) =>
                          setVitalForm({
                            ...vitalForm,
                            weight_kg: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="ehr-field">
                      <label>Notes</label>
                      <input
                        type="text"
                        className="ehr-input"
                        placeholder="e.g. Morning reading"
                        value={vitalForm.notes}
                        onChange={(e) =>
                          setVitalForm({ ...vitalForm, notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="ehr-form-actions">
                    <button
                      type="submit"
                      className="ehr-btn-primary"
                      disabled={savingVital}
                    >
                      {savingVital ? "Saving..." : "Save Reading"}
                    </button>
                  </div>
                </form>
              )}

              {vitals.length === 0 ? (
                <p className="ehr-empty-note">
                  No vitals logged yet. Click "+ Log Vitals" above to record
                  blood pressure, pulse, or weight readings.
                </p>
              ) : (
                <div className="ehr-table-wrap">
                  <table className="ehr-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Blood Pressure</th>
                        <th>Heart Rate</th>
                        <th>Weight</th>
                        <th>Status</th>
                        <th>Notes</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitals.map((v) => {
                        const bpStatus = getBpStatus(v.systolic, v.diastolic);
                        return (
                          <tr key={v.id}>
                            <td>
                              <strong>{v.recorded_date}</strong>
                            </td>
                            <td>
                              {v.systolic && v.diastolic
                                ? `${v.systolic}/${v.diastolic} mmHg`
                                : "—"}
                            </td>
                            <td>
                              {v.heart_rate ? `${v.heart_rate} bpm` : "—"}
                            </td>
                            <td>{v.weight_kg ? `${v.weight_kg} kg` : "—"}</td>
                            <td>
                              <span className={`vital-badge ${bpStatus.tone}`}>
                                {bpStatus.label}
                              </span>
                            </td>
                            <td>{v.notes || "—"}</td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                className="btn-delete-vital"
                                onClick={() => handleDeleteVital(v.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 3. Longitudinal Clinical History (Auto-Synced from Doctor Consultations & Rx) */}
            <div className="ehr-card">
              <div className="ehr-card-head">
                <div>
                  <span className="ehr-card-kicker">CLINICAL ARCHIVE</span>
                  <h2>Diagnosis & Medication History</h2>
                </div>
                <input
                  type="text"
                  className="ehr-search-input"
                  placeholder="Filter diagnoses or meds..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>

              <div className="ehr-two-col">
                {/* Diagnoses Column */}
                <div>
                  <h3
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      margin: "0 0 12px",
                    }}
                  >
                    Recorded Diagnoses ({filteredDiagnoses.length})
                  </h3>
                  {filteredDiagnoses.length === 0 ? (
                    <p className="ehr-empty-note">
                      No recorded diagnoses match your filter.
                    </p>
                  ) : (
                    <div className="history-list">
                      {filteredDiagnoses.map((d) => (
                        <div key={d.id} className="history-item">
                          <div className="history-item-top">
                            <h4>{d.diagnosis || "General Consultation"}</h4>
                            <span className="history-date-pill">
                              {d.dateStr}
                            </span>
                          </div>
                          <p className="history-meta">
                            <strong>Provider:</strong> {d.doctorName}
                          </p>
                          {d.chief_complaint && (
                            <p className="history-note">
                              Chief Complaint: {d.chief_complaint}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Medications Column */}
                <div>
                  <h3
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      margin: "0 0 12px",
                    }}
                  >
                    Prescribed Medications ({filteredMeds.length})
                  </h3>
                  {filteredMeds.length === 0 ? (
                    <p className="ehr-empty-note">
                      No prescribed medications match your filter.
                    </p>
                  ) : (
                    <div className="history-list">
                      {filteredMeds.map((m) => (
                        <div key={m.id} className="history-item">
                          <div className="history-item-top">
                            <h4>{m.medicine_name}</h4>
                            <span className="history-date-pill">
                              {m.dateStr}
                            </span>
                          </div>
                          <p className="history-meta">
                            {m.dosage} • {m.frequency}
                          </p>
                          <p className="history-note">
                            Prescribed by {m.doctorName}
                            {m.instructions ? ` — ${m.instructions}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
