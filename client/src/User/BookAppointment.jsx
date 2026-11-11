import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout/Layout";
import { supabase } from "../supabaseClient";
import "./BookAppointment.css";

export default function BookAppointment() {
  const navigate = useNavigate();

  // Form selections
  const [specialization, setSpecialization] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // New Required Input Fields
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Female");
  const [reasonForVisit, setReasonForVisit] = useState("");

  // Lists and state management
  const [specializations, setSpecializations] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]); // Stores time slots that are unavailable
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Default available time slots
  const availableSlots = [
    { start: "08:00", end: "08:30" },
    { start: "08:30", end: "09:00" },
    { start: "09:00", end: "09:30" },
    { start: "09:30", end: "10:00" },
    { start: "10:00", end: "10:30" },
    { start: "10:30", end: "11:00" },
    { start: "11:00", end: "11:30" },
    { start: "11:30", end: "12:00" },
    { start: "14:00", end: "14:30" },
    { start: "14:30", end: "15:00" },
    { start: "15:00", end: "15:30" },
    { start: "15:30", end: "16:00" },
  ];

  // 1. Fetch current user & doctors list on load
  useEffect(() => {
    const initData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch doctors profiles
      const { data: doctorsData } = await supabase
        .from("profiles")
        .select("id, full_name, specialization")
        .eq("role", "doctor");

      if (doctorsData) {
        setDoctorsList(doctorsData);
        // Unique list of specializations
        const uniqueSpecs = [
          ...new Set(doctorsData.map((d) => d.specialization).filter(Boolean)),
        ];
        setSpecializations(uniqueSpecs);
      }
    };

    initData();
  }, []);

  // Filter doctors based on selected specialization
  const filteredDoctors = doctorsList.filter(
    (doc) => !specialization || doc.specialization === specialization,
  );

  // 2. Query booked slots whenever doctor OR date changes to prevent double-booking
  useEffect(() => {
    const checkBookedSlots = async () => {
      if (!appointmentDate || !currentUser) return;

      // Query 1: Slots where selected Doctor is already booked
      let doctorBookings = [];
      if (doctorId) {
        const { data: dData } = await supabase
          .from("appointments")
          .select("start_time")
          .eq("doctor_id", doctorId)
          .eq("appointment_date", appointmentDate)
          .neq("status", "Cancelled");

        if (dData) doctorBookings = dData.map((b) => b.start_time);
      }

      // Query 2: Slots where logged-in Patient is ALREADY booked with ANY doctor at this time
      const { data: pData } = await supabase
        .from("appointments")
        .select("start_time")
        .eq("patient_id", currentUser.id)
        .eq("appointment_date", appointmentDate)
        .neq("status", "Cancelled");

      const patientBookings = pData ? pData.map((b) => b.start_time) : [];

      // Combine both lists to disable conflicted slots
      const totalUnavailable = [
        ...new Set([...doctorBookings, ...patientBookings]),
      ];
      setBookedSlots(totalUnavailable);
    };

    checkBookedSlots();
  }, [doctorId, appointmentDate, currentUser]);

  // 3. Handle Appointment Confirmation
  const handleConfirmAppointment = async (e) => {
    e.preventDefault();
    setError("");

    if (!doctorId) {
      setError("Please select a doctor.");
      return;
    }
    if (!appointmentDate) {
      setError("Please select an appointment date.");
      return;
    }
    if (!selectedTimeSlot) {
      setError("Please pick an available time slot.");
      return;
    }
    if (!age || !gender || !reasonForVisit.trim()) {
      setError("Please complete all patient demographic fields.");
      return;
    }

    setLoading(true);

    try {
      // Get patient profile full name
      const { data: patientProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentUser.id)
        .maybeSingle();

      const patientName = patientProfile?.full_name || currentUser.email;

      // Find doctor full name
      const selectedDoc = doctorsList.find((d) => d.id === doctorId);
      const doctorName = selectedDoc ? selectedDoc.full_name : "Doctor";

      // Formatted Demographics string: e.g. "34 yrs • Female"
      const formattedDemographics = `${age} yrs • ${gender}`;

      // Insert into Supabase appointments table
      const { error: insertError } = await supabase
        .from("appointments")
        .insert([
          {
            patient_id: currentUser.id,
            doctor_id: doctorId,
            doctor_name: doctorName,
            appointment_date: appointmentDate,
            start_time: selectedTimeSlot.start,
            end_time: selectedTimeSlot.end,
            status: "Confirmed",
            created_by: patientName,
            demographics: formattedDemographics,
            reason_for_visit: reasonForVisit.trim(),
          },
        ]);

      if (insertError) throw insertError;

      alert("Appointment booked successfully!");
      navigate("/appointments");
    } catch (err) {
      setError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="book-appointment-container">
        <h1 className="page-title">Book an appointment</h1>

        {error && <div className="booking-error-banner">{error}</div>}

        <div className="booking-cards-grid">
          {/* Card 1: Choose a doctor & Demographics */}
          <div className="booking-card">
            <h3>1. Choose a doctor & details</h3>

            <div className="form-group">
              <label>SPECIALIZATION</label>
              <select
                value={specialization}
                onChange={(e) => {
                  setSpecialization(e.target.value);
                  setDoctorId("");
                }}
              >
                <option value="">[Select specialization]</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>DOCTOR</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">
                  {specialization
                    ? "[Select doctor]"
                    : "[Select specialization first]"}
                </option>
                {filteredDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.full_name} ({doc.specialization || "General"})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>DATE</label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setSelectedTimeSlot(null);
                }}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            {/* New Required Fields */}
            <div className="form-row" style={{ display: "flex", gap: "12px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>AGE</label>
                <input
                  type="number"
                  placeholder="e.g. 34"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label>GENDER</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>REASON FOR VISIT</label>
              <input
                type="text"
                placeholder="e.g. Annual Cardiovascular Checkup"
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Card 2: Pick an available slot */}
          <div className="booking-card">
            <h3>2. Pick an available slot</h3>

            {!appointmentDate || !doctorId ? (
              <p className="card-placeholder-text">
                Select a doctor and date to view available time slots.
              </p>
            ) : (
              <>
                <p className="card-subtext">
                  Struck-through/grayed-out slots are already booked.
                </p>

                <div className="time-slots-grid">
                  {availableSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot.start);
                    const isSelected = selectedTimeSlot?.start === slot.start;

                    return (
                      <button
                        key={slot.start}
                        type="button"
                        disabled={isBooked}
                        className={`time-slot-btn ${
                          isBooked ? "disabled" : ""
                        } ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedTimeSlot(slot)}
                      >
                        {slot.start} – {slot.end}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="booking-actions">
              <button
                type="button"
                className="btn-confirm"
                disabled={loading || !selectedTimeSlot}
                onClick={handleConfirmAppointment}
              >
                {loading ? "Confirming..." : "Confirm appointment"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
