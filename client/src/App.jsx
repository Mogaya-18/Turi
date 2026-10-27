import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { adminRoutes } from "./Admin/Adminroutes";
// Teammates: import your own routes here, e.g. import { userRoutes } from "./User/userRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {adminRoutes}
        {/* {userRoutes} */}
        {/* Temporary: replace with the Login page route when it's built */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}