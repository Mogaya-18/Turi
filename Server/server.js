const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- MOCK DATABASE ---

// In-Memory User Store (Pre-seeded with demo accounts)
const users = [
  {
    id: 1,
    fullName: "Amelia Hart",
    email: "client@cura.demo",
    phone: "555-0192",
    password: "password123",
    role: "Patient",
    roleSpecificField: ""
  },
  {
    id: 2,
    fullName: "Dr. Maya Chen",
    email: "doctor@cura.demo",
    phone: "555-0193",
    password: "password123",
    role: "Doctor",
    roleSpecificField: "Cardiology - MD-90412"
  },
  {
    id: 3,
    fullName: "System Admin",
    email: "admin@cura.demo",
    phone: "555-0194",
    password: "password123",
    role: "Administrator",
    roleSpecificField: "ADM-8023"
  }
];

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

// 0. Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 1. User Registration Route
app.post("/api/auth/register", (req, res) => {
  const { fullName, email, phone, password, role, roleSpecificField } = req.body || {};

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full Name, Email, and Password are required." });
  }

  // Check if user already exists
  const existingUser = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  // Create new user object
  const newUser = {
    id: users.length + 1,
    fullName,
    email: email.toLowerCase(),
    phone: phone || "",
    password, // In production, hash this with bcrypt
    role: role || "Patient",
    roleSpecificField: roleSpecificField || ""
  };

  users.push(newUser);
  console.log("New user registered successfully:", newUser.email);

  res.status(201).json({ 
    message: "User registered successfully", 
    user: { id: newUser.id, email: newUser.email, role: newUser.role } 
  });
});

// 2. User Authentication / Login Route
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  // Find user by email
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  // Validate user existence
  if (!user) {
    return res.status(401).json({ message: "No account found with this email." });
  }

  // Validate password match
  if (user.password !== password) {
    return res.status(401).json({ message: "Incorrect password. Please try again." });
  }

  // Validate role workspace match (case-insensitive)
  if (role && user.role.toLowerCase() !== role.toLowerCase()) {
    return res.status(403).json({ 
      message: `Access denied. Account is registered as ${user.role}, not ${role}.` 
    });
  }

  // Successful Login Response with mock token
  res.json({
    message: "Logged in successfully",
    token: `mock-jwt-token-${user.id}-${Date.now()}`,
    role: user.role,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  });
});

// 3. Patient Dashboard Data
app.get("/api/patient/dashboard", (req, res) => {
  res.json({
    patientName: "Amelia Hart",
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

// 4. User Profile Routes
app.get("/api/user/profile", (req, res) => {
  res.json({
    fullName: "Amelia Hart",
    email: "client@cura.demo",
    phone: "555-0192",
  });
});

app.put("/api/user/profile", (req, res) => {
  console.log("Profile updated:", req.body);
  res.json({ message: "Profile updated successfully" });
});

// 5. Billing & Invoices
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

// 6. Prescription Refill
app.post("/api/prescriptions/:id/refill", (req, res) => {
  const { id } = req.params;
  console.log(`Refill requested for prescription ID: ${id}`);
  res.json({ message: "Refill requested successfully." });
});

// 7. Doctors & Specializations
app.get("/api/doctors/specializations", (req, res) => {
  res.json(specializations);
});

app.get("/api/doctors", (req, res) => {
  const spec = req.query.specialization;
  if (spec) {
    res.json(doctors.filter((d) => d.specialization === spec));
  } else {
    res.json(doctors);
  }
});

// 8. Appointment Slots & Booking
app.get("/api/slots", (req, res) => {
  res.json([
    { id: 1, time: "09:00", isBooked: false },
    { id: 2, time: "09:30", isBooked: true },
    { id: 3, time: "10:00", isBooked: false },
    { id: 4, time: "10:30", isBooked: false },
    { id: 5, time: "11:00", isBooked: false },
  ]);
});

app.post("/api/appointments/book", (req, res) => {
  const { slotId } = req.body || {};

  if (slotId === 2) {
    return res.status(409).json({ message: "Slot taken, retry." });
  }

  console.log(`Appointment booked for slot ID: ${slotId}`);
  res.json({ message: "Appointment booked successfully", slotId });
});

// 9. Consultations & Pharmacy
app.get("/api/consultations/current", (req, res) => {
  res.json({
    name: "Amelia Hart",
    age: 34,
    gender: "Female",
    appointmentTime: "10:00",
  });
});

app.get("/api/pharmacy/inventory", (req, res) => {
  res.json(pharmacyInventory);
});

app.post("/api/consultations", (req, res) => {
  const { notes, diagnosis, prescriptions, issueNow } = req.body || {};
  console.log("Consultation Saved:", { notes, diagnosis, prescriptions, issueNow });
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
  console.log(`[Turi Server] Listening for API requests from the React frontend...\n`);
});