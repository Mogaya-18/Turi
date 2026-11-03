const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- MOCK DATABASE ---
const specializations = [
  "Cardiology",
  "Dermatology",
  "General Practice",
  "Pediatrics",
];
const doctors = [
  { id: 1, fullName: "Alice Smith", specialization: "Cardiology" },
  { id: 2, fullName: "Bob Jones", specialization: "General Practice" },
  { id: 3, fullName: "Carol White", specialization: "Pediatrics" },
];

let pharmacyInventory = [
  { id: 1, medicineName: "Paracetamol 500mg", stock: 100, unitPrice: 5.0 },
  { id: 2, medicineName: "Amoxicillin 250mg", stock: 50, unitPrice: 15.0 },
  { id: 3, medicineName: "Ibuprofen 400mg", stock: 200, unitPrice: 8.0 },
];

// --- API ROUTES ---

// 0. HEALTH CHECK ROUTE (Fixes "Cannot GET /api/health")
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 1. Patient Dashboard Data
app.get("/api/patient/dashboard", (req, res) => {
  res.json({
    patientName: "John Doe",
    upcomingAppointment: {
      date: "2026-11-02",
      time: "10:00",
      doctorName: "Alice Smith",
      specialization: "Cardiology",
    },
    activePrescriptions: [
      {
        id: 101,
        medicineName: "Amoxicillin 250mg",
        dosageInstructions: "1 pill twice a day for 5 days",
        status: "issued",
      },
    ],
    billing: { date: "2026-10-15", amount: 50.0, status: "Unpaid" },
    medicalHistory: [
      {
        date: "2026-09-10",
        doctor: "Dr. Bob Jones",
        diagnosis: "Viral Infection",
        notes: "Advised rest and hydration",
      },
    ],
  });
});

// --- MOCK ROUTES FOR AUTH, PROFILE & INVOICE ---

app.post("/api/auth/register", (req, res) => {
  console.log("New user registered:", req.body?.email);
  res.status(201).json({ message: "User registered" });
});

app.post("/api/auth/login", (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (email.includes("admin")) {
    res.json({ role: "admin", message: "Logged in as Admin" });
  } else {
    res.json({ role: "Patient", message: "Logged in as Patient" });
  }
});

app.get("/api/user/profile", (req, res) => {
  res.json({
    fullName: "John Doe",
    email: "john@example.com",
    phone: "555-0192",
  });
});

app.put("/api/user/profile", (req, res) => {
  console.log("Profile updated:", req.body);
  res.json({ message: "Profile updated successfully" });
});

app.get("/api/billing/:id", (req, res) => {
  res.json({
    id: req.params.id,
    date: "2026-10-15",
    doctorName: "Dr. Alice Smith",
    status: "Unpaid",
    total: 50.0,
    items: [
      { description: "General Consultation", cost: 35.0 },
      { description: "Prescription Issuance", cost: 15.0 },
    ],
  });
});

// 2. Request Prescription Refill
app.post("/api/prescriptions/:id/refill", (req, res) => {
  const { id } = req.params;
  console.log(`Refill requested for prescription ID: ${id}`);
  res.json({ message: "Refill requested successfully." });
});

// 3. Get Doctor Specializations
app.get("/api/doctors/specializations", (req, res) => {
  res.json(specializations);
});

// 4. Get Doctors (filter by specialization)
app.get("/api/doctors", (req, res) => {
  const spec = req.query.specialization;
  if (spec) {
    res.json(doctors.filter((d) => d.specialization === spec));
  } else {
    res.json(doctors);
  }
});

// 5. Get Available Slots
app.get("/api/slots", (req, res) => {
  res.json([
    { id: 1, time: "09:00", isBooked: false },
    { id: 2, time: "09:30", isBooked: true },
    { id: 3, time: "10:00", isBooked: false },
    { id: 4, time: "10:30", isBooked: false },
    { id: 5, time: "11:00", isBooked: false },
  ]);
});

// 6. Book an Appointment
app.post("/api/appointments/book", (req, res) => {
  const { slotId } = req.body || {};

  if (slotId === 2) {
    return res.status(409).json({ message: "Slot taken, retry." });
  }

  console.log(`Appointment booked for slot ID: ${slotId}`);
  res.json({ message: "Appointment booked successfully", slotId });
});

// 7. Get Current Consultation Data
app.get("/api/consultations/current", (req, res) => {
  res.json({
    name: "John Doe",
    age: 34,
    gender: "Male",
    appointmentTime: "10:00",
  });
});

// 8. Get Pharmacy Inventory
app.get("/api/pharmacy/inventory", (req, res) => {
  res.json(pharmacyInventory);
});

// 9. Save Consultation / Issue Prescription
app.post("/api/consultations", (req, res) => {
  const { notes, diagnosis, prescriptions, issueNow } = req.body || {};
  console.log("Consultation Saved:", {
    notes,
    diagnosis,
    prescriptions,
    issueNow,
  });
  res.json({
    message: issueNow
      ? "Consultation saved and prescription issued."
      : "Consultation saved.",
  });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n[Turi Server] Running on http://localhost:${PORT}`);
  console.log(
    `[Turi Server] Listening for API requests from the React frontend...\n`,
  );
});
