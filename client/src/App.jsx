import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Components
import Login from "./Login/Login";
import Register from "./Login/Register";

// User / Patient Components
import Dashboard from "./User/Dashboard";
import BookAppointment from "./User/BookAppointment";
import Appointments from "./User/Appointments";
import HealthRecords from "./User/HealthRecords";
import Consultation from "./User/Consultation";
import Invoice from "./User/Invoice";
import Profile from "./User/Profile";
import { adminRoutes } from "./Admin/Adminroutes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {adminRoutes}
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient Portal Main Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/records" element={<HealthRecords />} />
        <Route path="/profile" element={<Profile />} />

        {/* Billing & Invoice Routes */}
        <Route path="/invoices" element={<Invoice />} />
        <Route path="/invoices/:id" element={<Invoice />} />

        {/* Messages & Settings Aliases */}
        <Route path="/messages" element={<Appointments />} /> {/* Temporary route pointing to empty state prototype */}
        <Route path="/settings" element={<Profile />} />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
