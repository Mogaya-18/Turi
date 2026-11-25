import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth & Route Guard Components
import Login from "./Login/Login";
import Register from "./Login/Register";
import ProtectedRoute from "./Login/ProtectedRoute";

// User / Patient Components
import Dashboard from "./User/Dashboard";
import BookAppointment from "./User/BookAppointment";
import Appointments from "./User/Appointments";
import HealthRecords from "./User/HealthRecords";
import Consultation from "./User/Consultation";
import Invoice from "./User/Invoice";
import Profile from "./User/Profile";
import { adminRoutes } from "./Admin/Adminroutes";
import DoctorDashboard from "./Doctor/DoctorDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          {adminRoutes}
        </Route>

        {/* Protected Doctor Routes */}
        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route
            path="/doctor"
            element={<Navigate to="/doctor/dashboard" replace />}
          />
        </Route>

        {/* Protected Patient Portal Routes */}
        <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
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
          <Route path="/messages" element={<Appointments />} />
          <Route path="/settings" element={<Profile />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
