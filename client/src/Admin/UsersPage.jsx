import { useState } from "react";
import { PageHead, DataTable, Badge } from "./components";

const seed = [
  { id: 1, name: "Amina Otieno", email: "amina@example.com", role: "Patient", active: true },
  { id: 2, name: "Dr. Brian Kamau", email: "brian@example.com", role: "Doctor", active: true },
  { id: 3, name: "Grace Wanjiru", email: "grace@example.com", role: "Admin", active: true },
];
const blank = { name: "", email: "", role: "Patient" };

export default function UsersPage() {
  const [users, setUsers] = useState(seed);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All roles");
  const [form, setForm] = useState(null); // null = closed

  const shown = users.filter(
    (u) =>
      (role === "All roles" || u.role === role) &&
      (u.name + u.email).toLowerCase().includes(q.toLowerCase())
  );

  const save = (e) => {
    e.preventDefault();
    setUsers((list) =>
      form.id
        ? list.map((u) => (u.id === form.id ? { ...u, ...form } : u))
        : [...list, { ...form, id: Date.now(), active: true }]
    );
    setForm(null);
  };
  const toggle = (id) =>
    setUsers((l) => l.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "active", label: "Status", render: (u) => <Badge tone={u.active ? "ok" : "bad"}>{u.active ? "Active" : "Disabled"}</Badge> },
    { key: "a", label: "Actions", render: (u) => (
      <div className="actions">
        <button className="btn alt sm" onClick={() => setForm(u)}>Edit</button>
        <button className="btn danger sm" onClick={() => toggle(u.id)}>{u.active ? "Disable" : "Enable"}</button>
      </div>
    ) },
  ];

  return (
    <>
      <PageHead title="User management">
        <button className="btn" onClick={() => setForm(blank)}>Add user</button>
      </PageHead>

      {form && (
        <form className="panel" onSubmit={save}>
          <h3>{form.id ? "Edit user" : "Add user"}</h3>
          <div className="form-grid">
            <label>Name<input className="field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Email<input className="field" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Role
              <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option>Patient</option><option>Doctor</option><option>Admin</option>
              </select>
            </label>
            <div className="actions">
              <button className="btn" type="submit">Save user</button>
              <button className="btn alt" type="button" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </div>
        </form>
      )}

      <div className="toolbar">
        <input className="field" aria-label="Search users" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field" aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option>All roles</option><option>Patient</option><option>Doctor</option><option>Admin</option>
        </select>
      </div>
      <DataTable columns={columns} rows={shown} empty="No users match your search." />
    </>
  );
}