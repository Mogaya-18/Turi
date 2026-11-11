import { useState, useEffect } from "react";
import { PageHead, DataTable, Badge } from "./components";
import { supabase } from "../supabaseClient";

const blank = { full_name: "", email: "", role: "patient", active: true };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [form, setForm] = useState(null);

  // Fetch profiles from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter logic for Search and Role
  const shown = users.filter((u) => {
    const matchesRole =
      roleFilter === "All roles" ||
      u.role?.toLowerCase() === roleFilter.toLowerCase();
    const matchesQuery =
      (u.full_name || "").toLowerCase().includes(q.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(q.toLowerCase());
    return matchesRole && matchesQuery;
  });

  // Save (Insert / Update)
  const save = async (e) => {
    e.preventDefault();

    const payload = {
      full_name: form.full_name,
      email: form.email,
      role: form.role.toLowerCase(),
    };

    if (form.id) {
      // Update existing user profile
      const { error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", form.id);

      if (error) {
        alert("Failed to update user: " + error.message);
        return;
      }
    } else {
      // Insert new profile record
      const { error } = await supabase
        .from("profiles")
        .insert([{ ...payload, active: true }]);

      if (error) {
        alert("Failed to add user: " + error.message);
        return;
      }
    }

    setForm(null);
    fetchUsers();
  };

  // Toggle Active/Disabled Status
  const toggleStatus = async (user) => {
    const { error } = await supabase
      .from("profiles")
      .update({ active: !user.active })
      .eq("id", user.id);

    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      fetchUsers();
    }
  };

  // Delete User Profile
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      alert("Failed to delete user: " + error.message);
    } else {
      fetchUsers();
    }
  };

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Role",
      render: (u) =>
        u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : "",
    },
    {
      key: "active",
      label: "Status",
      render: (u) => (
        <Badge tone={u.active !== false ? "ok" : "bad"}>
          {u.active !== false ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "a",
      label: "Actions",
      render: (u) => (
        <div className="actions">
          <button className="btn alt sm" onClick={() => setForm(u)}>
            Edit
          </button>
          <button className="btn alt sm" onClick={() => toggleStatus(u)}>
            {u.active !== false ? "Disable" : "Enable"}
          </button>
          <button className="btn danger sm" onClick={() => deleteUser(u.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead title="User management">
        <button className="btn" onClick={() => setForm(blank)}>
          Add user
        </button>
      </PageHead>

      {form && (
        <form className="panel" onSubmit={save}>
          <h3>{form.id ? "Edit user" : "Add user"}</h3>
          <div className="form-grid">
            <label>
              Name
              <input
                className="field"
                required
                value={form.full_name || ""}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            </label>
            <label>
              Email
              <input
                className="field"
                type="email"
                required
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              Role
              <select
                className="field"
                value={form.role?.toLowerCase() || "patient"}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <div className="actions">
              <button className="btn" type="submit">
                Save user
              </button>
              <button
                className="btn alt"
                type="button"
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="toolbar">
        <input
          className="field"
          aria-label="Search users"
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="field"
          aria-label="Filter by role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option>All roles</option>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <DataTable
          columns={columns}
          rows={shown}
          empty="No users match your search."
        />
      )}
    </>
  );
}
