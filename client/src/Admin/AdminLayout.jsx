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
      <aside className="admin-side">
        <div className="brand"><span className="mark" aria-hidden="true">+</span>Turi</div>
        <div className="workspace">Workspace<b>Clinic admin</b></div>
        <p className="menu-label">MENU</p>
        <nav className="admin-nav" aria-label="Admin sections">
          {links.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end}>{label}</NavLink>
          ))}
        </nav>
        <div className="side-user">
          <span className="avatar" aria-hidden="true">AD</span>
          <div>Admin<small>Administrator</small></div>
          <button className="btn alt sm" onClick={() => navigate("/")}>Log out</button>
        </div>
      </aside>
      <div className="admin-content">
        <main className="admin-main"><Outlet /></main>
      </div>
    </div>
  );
}