import { useState } from "react";
import { PageHead, DataTable, Badge } from "./components";
import { doctors, queueSeed, stockSeed, auditSeed } from "./mockData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/* ---------- Roles ---------- */
const perms = ["Book appointments", "Record notes and prescriptions", "Manage users", "Manage doctor schedules", "View reports", "Manage stock", "View audit log"];
const roleSeed = { Patient: [0], Doctor: [0, 1], Admin: [2, 3, 4, 5, 6] };

export function RolesPage() {
  const [grants, setGrants] = useState(roleSeed);
  const flip = (role, i) =>
    setGrants((g) => ({ ...g, [role]: g[role].includes(i) ? g[role].filter((x) => x !== i) : [...g[role], i] }));
  return (
    <>
      <PageHead title="Roles and permissions" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Permission</th>{Object.keys(grants).map((r) => <th key={r}>{r}</th>)}</tr></thead>
          <tbody>
            {perms.map((p, i) => (
              <tr key={p}>
                <td>{p}</td>
                {Object.keys(grants).map((r) => (
                  <td key={r}>
                    <input type="checkbox" aria-label={`${r}: ${p}`} checked={grants[r].includes(i)} onChange={() => flip(r, i)} />
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
  const [slots, setSlots] = useState([
    { id: 1, doctor: doctors[0], day: "Monday", start: "08:00", end: "12:00" },
    { id: 2, doctor: doctors[1], day: "Tuesday", start: "13:00", end: "17:00" },
  ]);
  const [f, setF] = useState({ doctor: doctors[0], day: "Monday", start: "08:00", end: "12:00" });
  const [err, setErr] = useState("");

  const add = (e) => {
    e.preventDefault();
    if (f.end <= f.start) return setErr("End time must be after start time.");
    if (slots.some((s) => s.doctor === f.doctor && s.day === f.day && f.start < s.end && f.end > s.start))
      return setErr("This overlaps an existing slot for the same doctor and day.");
    setErr("");
    setSlots([...slots, { ...f, id: Date.now() }]);
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const columns = [
    { key: "doctor", label: "Doctor" },
    { key: "day", label: "Day" },
    { key: "start", label: "Start" },
    { key: "end", label: "End" },
    { key: "a", label: "Actions", render: (s) => (
      <button className="btn danger sm" onClick={() => setSlots(slots.filter((x) => x.id !== s.id))}>Remove</button>
    ) },
  ];
  return (
    <>
      <PageHead title="Doctor schedules" />
      <form className="panel" onSubmit={add}>
        <h3>Add availability</h3>
        <div className="form-grid">
          <label>Doctor<select className="field" value={f.doctor} onChange={set("doctor")}>{doctors.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label>Day<select className="field" value={f.day} onChange={set("day")}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label>Start<input className="field" type="time" value={f.start} onChange={set("start")} /></label>
          <label>End<input className="field" type="time" value={f.end} onChange={set("end")} /></label>
          <button className="btn" type="submit">Add slot</button>
        </div>
        {err && <p role="alert" style={{ color: "var(--bad)" }}>{err}</p>}
      </form>
      <DataTable columns={columns} rows={slots} empty="No availability set. Add a slot above." />
    </>
  );
}

/* ---------- Patient queue ---------- */
const tone = { Waiting: "warn", "In consultation": "ok", Done: "" };

export function QueuePage() {
  const [rows, setRows] = useState(queueSeed.filter((r) => r.date === "2026-10-26"));
  const [doc, setDoc] = useState("All doctors");
  const move = (id, status) => setRows(rows.map((r) => (r.id === id ? { ...r, status } : r)));
  const shown = rows.filter((r) => doc === "All doctors" || r.doctor === doc);
  const columns = [
    { key: "time", label: "Time" },
    { key: "patient", label: "Patient" },
    { key: "doctor", label: "Doctor" },
    { key: "status", label: "Status", render: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge> },
    { key: "a", label: "Actions", render: (r) =>
      r.status === "Waiting" ? <button className="btn alt sm" onClick={() => move(r.id, "In consultation")}>Call in</button>
      : r.status === "In consultation" ? <button className="btn sm" onClick={() => move(r.id, "Done")}>Mark done</button>
      : null },
  ];
  return (
    <>
      <PageHead title="Patient queue" />
      <div className="toolbar">
        <select className="field" aria-label="Filter by doctor" value={doc} onChange={(e) => setDoc(e.target.value)}>
          <option>All doctors</option>{doctors.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <DataTable columns={columns} rows={shown} empty="No patients in the queue." />
    </>
  );
}

/* ---------- Stock ---------- */
export function StockPage() {
  const [items, setItems] = useState(stockSeed);
  const [q, setQ] = useState("");
  const restock = (id) => setItems(items.map((i) => (i.id === id ? { ...i, qty: i.qty + 20 } : i)));
  const columns = [
    { key: "medicine", label: "Medicine" },
    { key: "qty", label: "In stock" },
    { key: "reorder", label: "Reorder at" },
    { key: "s", label: "Status", render: (i) => <Badge tone={i.qty <= i.reorder ? "bad" : "ok"}>{i.qty <= i.reorder ? "Low" : "OK"}</Badge> },
    { key: "a", label: "Actions", render: (i) => <button className="btn alt sm" onClick={() => restock(i.id)}>Restock +20</button> },
  ];
  return (
    <>
      <PageHead title="Pharmacy stock" />
      <div className="toolbar">
        <input className="field" aria-label="Search medicines" placeholder="Search medicines" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <DataTable columns={columns} rows={items.filter((i) => i.medicine.toLowerCase().includes(q.toLowerCase()))} empty="No medicines match your search." />
    </>
  );
}

/* ---------- Reports ---------- */
function downloadCsv(name, cols, rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [cols.map((c) => esc(c.label)), ...rows.map((r) => cols.map((c) => esc(r[c.key])))].map((r) => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = name;
  a.click();
}

export function ReportsPage() {
  const [type, setType] = useState("queue");
  const [range, setRange] = useState({ from: "", to: "" });
  const inRange = (d) => (!range.from || d >= range.from) && (!range.to || d <= range.to);
  const cols = type === "queue"
    ? [{ key: "date", label: "Date" }, { key: "patient", label: "Patient" }, { key: "doctor", label: "Doctor" }, { key: "status", label: "Status" }]
    : [{ key: "medicine", label: "Medicine" }, { key: "qty", label: "In stock" }, { key: "reorder", label: "Reorder at" }];
  const rows = type === "queue" ? queueSeed.filter((r) => inRange(r.date)) : stockSeed;
  return (
    <>
      <PageHead title="Reports" />
      <div className="panel">
        <div className="form-grid">
          <label>From<input className="field" type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
          <label>To<input className="field" type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
          <button className={`btn ${type === "queue" ? "" : "alt"}`} onClick={() => setType("queue")}>Queue report</button>
          <button className={`btn ${type === "stock" ? "" : "alt"}`} onClick={() => setType("stock")}>Stock report</button>
        </div>
        {type === "stock" && <p>The stock report shows current levels, so the date range does not apply.</p>}
      </div>
      <div className="toolbar">
        <button className="btn alt" disabled={!rows.length} onClick={() => downloadCsv(`${type}-report.csv`, cols, rows)}>Download CSV</button>
      </div>
      <DataTable columns={cols} rows={rows} empty="No records in this date range." />
    </>
  );
}

/* ---------- Audit log (read-only) ---------- */
export function AuditPage() {
  const [q, setQ] = useState("");
  const rows = auditSeed.filter((r) => Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()));
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
        <input className="field" aria-label="Search audit log" placeholder="Search by person or action" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <DataTable columns={columns} rows={rows} empty="No entries match your search." />
    </>
  );
}