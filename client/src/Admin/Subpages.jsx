import { useState, useEffect } from "react";
import { PageHead, DataTable, Badge } from "./components";
import { auditSeed } from "./Mockdata";
import { supabase } from "../supabaseClient";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/* ---------- Roles ---------- */
const perms = [
  "Book appointments",
  "Record notes and prescriptions",
  "Manage users",
  "Manage doctor schedules",
  "View reports",
  "Manage stock",
  "View audit log",
];
const roleSeed = { Patient: [0], Doctor: [0, 1], Admin: [2, 3, 4, 5, 6] };

export function RolesPage() {
  const [grants, setGrants] = useState(roleSeed);
  const flip = (role, i) =>
    setGrants((g) => ({
      ...g,
      [role]: g[role].includes(i)
        ? g[role].filter((x) => x !== i)
        : [...g[role], i],
    }));
  return (
    <>
      <PageHead title="Roles and permissions" />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Permission</th>
              {Object.keys(grants).map((r) => (
                <th key={r}>{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perms.map((p, i) => (
              <tr key={p}>
                <td>{p}</td>
                {Object.keys(grants).map((r) => (
                  <td key={r}>
                    <input
                      type="checkbox"
                      aria-label={`${r}: ${p}`}
                      checked={grants[r].includes(i)}
                      onChange={() => flip(r, i)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- Doctor schedules ---------- */
export function SchedulesPage() {
  const [docList, setDocList] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({
    doctor: "",
    day: "Monday",
    start: "08:00",
    end: "12:00",
  });
  const [err, setErr] = useState("");

  const fetchData = async () => {
    setLoading(true);

    const { data: docData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "doctor");

    const { data: slotData, error } = await supabase
      .from("doctor_schedules")
      .select("*")
      .order("created_at", { ascending: false });

    if (docData && docData.length > 0) {
      setDocList(docData);
      setF((prev) => ({
        ...prev,
        doctor: prev.doctor || docData[0].full_name,
      }));
    }

    if (!error) {
      setSlots(slotData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    if (f.end <= f.start) return setErr("End time must be after start time.");

    if (
      slots.some(
        (s) =>
          s.doctor_name === f.doctor &&
          s.day === f.day &&
          f.start < s.end_time &&
          f.end > s.start_time,
      )
    ) {
      return setErr(
        "This overlaps an existing slot for the same doctor and day.",
      );
    }
    setErr("");

    const selectedDoc = docList.find((d) => d.full_name === f.doctor);

    const { error } = await supabase.from("doctor_schedules").insert([
      {
        doctor_id: selectedDoc?.id || null,
        doctor_name: f.doctor,
        day: f.day,
        start_time: f.start,
        end_time: f.end,
      },
    ]);

    if (error) {
      setErr("Failed to save schedule slot: " + error.message);
    } else {
      fetchData();
    }
  };

  const removeSlot = async (id) => {
    const { error } = await supabase
      .from("doctor_schedules")
      .delete()
      .eq("id", id);
    if (error) {
      alert("Failed to remove slot: " + error.message);
    } else {
      fetchData();
    }
  };

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const columns = [
    { key: "doctor_name", label: "Doctor" },
    { key: "day", label: "Day" },
    { key: "start_time", label: "Start" },
    { key: "end_time", label: "End" },
    {
      key: "a",
      label: "Actions",
      render: (s) => (
        <button className="btn danger sm" onClick={() => removeSlot(s.id)}>
          Remove
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHead title="Doctor schedules" />
      <form className="panel" onSubmit={addSlot}>
        <h3>Add availability</h3>
        <div className="form-grid">
          <label>
            Doctor
            <select className="field" value={f.doctor} onChange={set("doctor")}>
              {docList.length === 0 ? (
                <option value="">No doctors available</option>
              ) : (
                docList.map((d) => (
                  <option key={d.id} value={d.full_name}>
                    {d.full_name}
                  </option>
                ))
              )}
            </select>
          </label>
          <label>
            Day
            <select className="field" value={f.day} onChange={set("day")}>
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Start
            <input
              className="field"
              type="time"
              value={f.start}
              onChange={set("start")}
            />
          </label>
          <label>
            End
            <input
              className="field"
              type="time"
              value={f.end}
              onChange={set("end")}
            />
          </label>
          <button className="btn" type="submit" disabled={!docList.length}>
            Add slot
          </button>
        </div>
        {err && (
          <p role="alert" style={{ color: "var(--bad)" }}>
            {err}
          </p>
        )}
      </form>

      {loading ? (
        <p>Loading schedules...</p>
      ) : (
        <DataTable
          columns={columns}
          rows={slots}
          empty="No availability set. Add a slot above."
        />
      )}
    </>
  );
}

/* ---------- Patient queue (Connected to Supabase System-Wide Appointments) ---------- */
const tone = {
  Waiting: "warn",
  Confirmed: "warn",
  Pending: "warn",
  "In consultation": "ok",
  CheckedIn: "ok",
  Completed: "",
  Done: "",
};

export function QueuePage() {
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("All doctors");
  const [loading, setLoading] = useState(true);

  // Fetch real system-wide appointments and doctor filter list from Supabase
  const fetchQueueData = async () => {
    setLoading(true);

    // Fetch doctors for filter dropdown
    const { data: docData } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "doctor");

    if (docData) {
      setDoctorsList(docData);
    }

    // Fetch system-wide appointments
    const { data: apptData, error } = await supabase
      .from("appointments")
      .select("*")
      .order("start_time", { ascending: true });

    if (!error && apptData) {
      setAppointments(apptData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueueData();
  }, []);

  // Update appointment status (Call in / Mark done)
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      fetchQueueData();
    }
  };

  // Filter queue by selected doctor
  const shown = appointments.filter((r) => {
    if (selectedDoctor === "All doctors") return true;
    return r.doctor_name === selectedDoctor || r.doctor_id === selectedDoctor;
  });

  const columns = [
    { key: "start_time", label: "Time" },
    {
      key: "created_by",
      label: "Patient",
      render: (r) => r.created_by || "Patient",
    },
    {
      key: "doctor_name",
      label: "Doctor",
      render: (r) => r.doctor_name || "Doctor",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge tone={tone[r.status] || "warn"}>{r.status || "Waiting"}</Badge>
      ),
    },
    {
      key: "a",
      label: "Actions",
      render: (r) => {
        const currentStatus = r.status || "Waiting";
        if (currentStatus === "In consultation") {
          return (
            <button
              className="btn sm"
              onClick={() => updateStatus(r.id, "Completed")}
            >
              Mark done
            </button>
          );
        }
        if (currentStatus !== "Completed") {
          return (
            <button
              className="btn alt sm"
              onClick={() => updateStatus(r.id, "In consultation")}
            >
              Call in
            </button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <>
      <PageHead title="Patient queue" />
      <div className="toolbar">
        <select
          className="field"
          aria-label="Filter by doctor"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
        >
          <option>All doctors</option>
          {doctorsList.map((d) => (
            <option key={d.id} value={d.full_name}>
              {d.full_name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading patient queue...</p>
      ) : (
        <DataTable
          columns={columns}
          rows={shown}
          empty="No patients in the queue."
        />
      )}
    </>
  );
}

/* ---------- Stock ---------- */
const emptyStockItem = { medicine: "", qty: 0, reorder: 0 };

export function StockPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modalItem, setModalItem] = useState(null);

  const fetchStock = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pharmacy_stock")
      .select("*")
      .order("medicine", { ascending: true });

    if (error) console.error("Error fetching stock:", error);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const saveItem = async (e) => {
    e.preventDefault();
    if (modalItem.id) {
      const { error } = await supabase
        .from("pharmacy_stock")
        .update({
          medicine: modalItem.medicine,
          qty: Number(modalItem.qty),
          reorder: Number(modalItem.reorder),
        })
        .eq("id", modalItem.id);

      if (error) alert("Failed to update item: " + error.message);
    } else {
      const { error } = await supabase.from("pharmacy_stock").insert([
        {
          medicine: modalItem.medicine,
          qty: Number(modalItem.qty),
          reorder: Number(modalItem.reorder),
        },
      ]);

      if (error) alert("Failed to add item: " + error.message);
    }
    setModalItem(null);
    fetchStock();
  };

  const deleteItem = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this medicine record?")
    )
      return;
    const { error } = await supabase
      .from("pharmacy_stock")
      .delete()
      .eq("id", id);
    if (error) alert("Failed to delete item: " + error.message);
    else fetchStock();
  };

  const restock = async (item) => {
    const { error } = await supabase
      .from("pharmacy_stock")
      .update({ qty: item.qty + 20 })
      .eq("id", item.id);

    if (error) alert("Failed to restock: " + error.message);
    else fetchStock();
  };

  const columns = [
    { key: "medicine", label: "Medicine" },
    { key: "qty", label: "In stock" },
    { key: "reorder", label: "Reorder at" },
    {
      key: "s",
      label: "Status",
      render: (i) => (
        <Badge tone={i.qty <= i.reorder ? "bad" : "ok"}>
          {i.qty <= i.reorder ? "Low" : "OK"}
        </Badge>
      ),
    },
    {
      key: "a",
      label: "Actions",
      render: (i) => (
        <div className="actions">
          <button className="btn alt sm" onClick={() => restock(i)}>
            +20
          </button>
          <button className="btn alt sm" onClick={() => setModalItem(i)}>
            Edit
          </button>
          <button className="btn danger sm" onClick={() => deleteItem(i.id)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead title="Pharmacy stock">
        <button className="btn" onClick={() => setModalItem(emptyStockItem)}>
          Add medicine
        </button>
      </PageHead>

      <div className="toolbar">
        <input
          className="field"
          aria-label="Search medicines"
          placeholder="Search medicines"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading pharmacy stock...</p>
      ) : (
        <DataTable
          columns={columns}
          rows={items.filter((i) =>
            i.medicine.toLowerCase().includes(q.toLowerCase()),
          )}
          empty="No medicines match your search."
        />
      )}

      {modalItem && (
        <div className="modal-overlay" onClick={() => setModalItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalItem.id ? "Edit medicine" : "Add medicine"}</h3>
            <form onSubmit={saveItem} style={{ marginTop: "16px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Medicine Name
                  <input
                    className="field"
                    required
                    style={{ marginTop: "4px" }}
                    value={modalItem.medicine}
                    onChange={(e) =>
                      setModalItem({ ...modalItem, medicine: e.target.value })
                    }
                  />
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                    In Stock Quantity
                    <input
                      className="field"
                      type="number"
                      required
                      min="0"
                      style={{ marginTop: "4px" }}
                      value={modalItem.qty}
                      onChange={(e) =>
                        setModalItem({ ...modalItem, qty: e.target.value })
                      }
                    />
                  </label>
                  <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Reorder Threshold
                    <input
                      className="field"
                      type="number"
                      required
                      min="0"
                      style={{ marginTop: "4px" }}
                      value={modalItem.reorder}
                      onChange={(e) =>
                        setModalItem({ ...modalItem, reorder: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div
                  className="actions"
                  style={{ marginTop: "12px", justifyContent: "flex-end" }}
                >
                  <button
                    className="btn alt"
                    type="button"
                    onClick={() => setModalItem(null)}
                  >
                    Cancel
                  </button>
                  <button className="btn" type="submit">
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Reports ---------- */
function downloadCsv(name, cols, rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    cols.map((c) => esc(c.label)),
    ...rows.map((r) => cols.map((c) => esc(r[c.key]))),
  ]
    .map((r) => r.join(","))
    .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
}

export function ReportsPage() {
  const [type, setType] = useState("queue");
  const [range, setRange] = useState({ from: "", to: "" });

  const cols =
    type === "queue"
      ? [
          { key: "appointment_date", label: "Date" },
          { key: "created_by", label: "Patient" },
          { key: "doctor_name", label: "Doctor" },
          { key: "status", label: "Status" },
        ]
      : [
          { key: "medicine", label: "Medicine" },
          { key: "qty", label: "In stock" },
          { key: "reorder", label: "Reorder at" },
        ];

  return (
    <>
      <PageHead title="Reports" />
      <div className="panel">
        <div className="form-grid">
          <label>
            From
            <input
              className="field"
              type="date"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
            />
          </label>
          <label>
            To
            <input
              className="field"
              type="date"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
            />
          </label>
          <button
            className={`btn ${type === "queue" ? "" : "alt"}`}
            onClick={() => setType("queue")}
          >
            Queue report
          </button>
          <button
            className={`btn ${type === "stock" ? "" : "alt"}`}
            onClick={() => setType("stock")}
          >
            Stock report
          </button>
        </div>
        {type === "stock" && (
          <p>
            The stock report shows current levels, so the date range does not
            apply.
          </p>
        )}
      </div>
      <div className="toolbar">
        <button className="btn alt" disabled>
          Download CSV
        </button>
      </div>
      <DataTable
        columns={cols}
        rows={[]}
        empty="No records in this date range."
      />
    </>
  );
}

/* ---------- Audit log (read-only) ---------- */
export function AuditPage() {
  const [q, setQ] = useState("");
  const rows = auditSeed.filter((r) =>
    Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  const columns = [
    { key: "time", label: "Time" },
    { key: "actor", label: "Who" },
    { key: "action", label: "Action" },
    { key: "target", label: "Details" },
  ];
  return (
    <>
      <PageHead title="Audit log" />
      <div className="toolbar">
        <input
          className="field"
          aria-label="Search audit log"
          placeholder="Search by person or action"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        empty="No entries match your search."
      />
    </>
  );
}
