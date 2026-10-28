import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./User/Dashboard";
import BookAppointment from "./User/BookAppointment";
import Consultation from "./User/Consultation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/consultation" element={<Consultation />} />
      </Routes>
    </BrowserRouter>
  );
}