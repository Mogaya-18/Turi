import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { adminRoutes } from "./Admin/Adminroutes"; // Ensure this is active in your real code
// Auth Routes
import Login from "./Login/Login";
import Register from "./Login/Register";
// User Routes
import Dashboard from "./User/Dashboard";
import BookAppointment from "./User/BookAppointment";
import Consultation from "./User/Consultation";
import Profile from "./User/Profile";
import Invoice from "./User/Invoice";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* {adminRoutes} */}

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User / Patient Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/invoice/:id" element={<Invoice />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}