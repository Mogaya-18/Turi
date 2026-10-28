// Sample data. Replace each export with a fetch("/api/...") call when the server is ready.
export const doctors = ["Dr. Brian Kamau", "Dr. Faith Njeri", "Dr. Peter Odhiambo"];

export const queueSeed = [
  { id: 1, date: "2026-10-26", patient: "Amina Otieno", doctor: "Dr. Brian Kamau", time: "09:00", status: "In consultation" },
  { id: 2, date: "2026-10-26", patient: "John Mutiso", doctor: "Dr. Brian Kamau", time: "09:20", status: "Waiting" },
  { id: 3, date: "2026-10-26", patient: "Lucy Achieng", doctor: "Dr. Faith Njeri", time: "09:30", status: "Waiting" },
  { id: 4, date: "2026-10-25", patient: "Samuel Kiptoo", doctor: "Dr. Faith Njeri", time: "14:00", status: "Done" },
];

export const stockSeed = [
  { id: 1, medicine: "Amoxicillin 500mg", qty: 120, reorder: 50 },
  { id: 2, medicine: "Paracetamol 500mg", qty: 30, reorder: 80 },
  { id: 3, medicine: "ORS sachets", qty: 64, reorder: 40 },
  { id: 4, medicine: "Metformin 500mg", qty: 12, reorder: 30 },
];

export const auditSeed = [
  { id: 1, time: "2026-10-26 08:55", actor: "Grace Wanjiru", action: "Disabled user", target: "Peter Odhiambo" },
  { id: 2, time: "2026-10-26 08:40", actor: "Grace Wanjiru", action: "Changed role", target: "Faith Njeri: Patient to Doctor" },
  { id: 3, time: "2026-10-25 16:12", actor: "Dr. Faith Njeri", action: "Added prescription", target: "Samuel Kiptoo" },
  { id: 4, time: "2026-10-25 11:03", actor: "Grace Wanjiru", action: "Restocked", target: "Amoxicillin 500mg (+60)" },
];