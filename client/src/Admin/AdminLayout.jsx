import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./Admin.css";

const links = [
  ["/admin", "Users", true],
  ["/admin/roles", "Roles"],
  ["/admin/schedules", "Doctor schedules"],
  ["/admin/queue", "Patient queue"],
  ["/admin/stock", "Stock"],
  ["/admin/reports", "Reports"],
  ["/admin/audit", "Audit log"],
];

export default function AdminLayout() {
  const navigate = useNavigate();
  return (
    <div className="admin">
      <header className="admin-top">
        <span className="logo">Turi Admin</span>
        <span>Admin</span>
        <button className="btn alt sm" onClick={() => navigate("/")}>Log out</button>
      </header>
      <div className="admin-body">
        <nav className="admin-side" aria-label="Admin sections">
          {links.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end}>{label}</NavLink>
          ))}
        </nav>
        <main className="admin-main"><Outlet /></main>
      </div>
    </div>
  );
}