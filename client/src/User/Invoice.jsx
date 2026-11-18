import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout/Layout";
import { supabase } from "../supabaseClient";
import "./Invoice.css";

const BASE_CONSULTATION_FEE = 2500;
const PER_MEDICATION_FEE = 650;

function generateMpesaRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SLK";
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mpesa"); // "mpesa" | "card"
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [paymentStep, setPaymentStep] = useState("input"); // "input" | "processing" | "success"
  const [paymentError, setPaymentError] = useState("");
  const [lastReceiptRef, setLastReceiptRef] = useState("");

  const loadPatientInvoices = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch Patient Profile Name
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    const patientName =
      profileData?.full_name || user.email?.split("@")[0] || "Patient";
    if (profileData?.phone) {
      setPhoneNumber(profileData.phone);
    }

    // 2. Fetch Patient Appointments (newest first)
    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", user.id)
      .order("appointment_date", { ascending: false });

    if (!appts || appts.length === 0) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    // 3. Fetch Consultations & Prescriptions for this patient
    const { data: consults } = await supabase
      .from("consultations")
      .select("id, appointment_id")
      .eq("patient_id", user.id);

    const { data: rxList } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", user.id);

    // 4. Fetch any existing invoice records in Supabase
    const { data: existingInvoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("patient_id", user.id);

    const existingMap = {};
    (existingInvoices || []).forEach((inv) => {
      existingMap[inv.appointment_id] = inv;
    });

    // 5. Build or sync invoice records per appointment
    const builtInvoices = [];

    for (const apt of appts) {
      // Find matching consultation & prescriptions
      const matchingConsultIds = (consults || [])
        .filter((c) => c.appointment_id === apt.id)
        .map((c) => c.id);

      const visitRx = (rxList || []).filter((rx) =>
        matchingConsultIds.includes(rx.consultation_id),
      );

      const rxFee = visitRx.length * PER_MEDICATION_FEE;
      const totalAmount = BASE_CONSULTATION_FEE + rxFee;

      // Line items breakdown
      const lineItems = [
        {
          description: `Clinical Consultation — ${apt.doctor_name || "Doctor"} (${apt.start_time || "30 min"})`,
          amount: BASE_CONSULTATION_FEE,
        },
        ...visitRx.map((med) => ({
          description: `Prescription: ${med.medicine_name} (${med.dosage || "Standard"})`,
          amount: PER_MEDICATION_FEE,
        })),
      ];

      let dbRecord = existingMap[apt.id];
      const generatedInvNumber = `INV-${String(apt.id).padStart(6, "0")}`;

      if (!dbRecord) {
        // Insert new UNPAID invoice record into Supabase
        const { data: inserted } = await supabase
          .from("invoices")
          .insert([
            {
              invoice_number: generatedInvNumber,
              appointment_id: apt.id,
              patient_id: user.id,
              doctor_name: apt.doctor_name || "Attending Doctor",
              service_date: apt.appointment_date,
              consultation_fee: BASE_CONSULTATION_FEE,
              prescription_fee: rxFee,
              total_amount: totalAmount,
              status: "UNPAID",
            },
          ])
          .select()
          .maybeSingle();

        dbRecord = inserted || {
          id: `local-${apt.id}`,
          invoice_number: generatedInvNumber,
          appointment_id: apt.id,
          patient_id: user.id,
          doctor_name: apt.doctor_name || "Attending Doctor",
          service_date: apt.appointment_date,
          consultation_fee: BASE_CONSULTATION_FEE,
          prescription_fee: rxFee,
          total_amount: totalAmount,
          status: "UNPAID",
        };
      } else if (
        dbRecord.status === "UNPAID" &&
        Number(dbRecord.total_amount) !== totalAmount
      ) {
        // Sync updated prescription fee if doctor added medications after initial invoice creation
        await supabase
          .from("invoices")
          .update({
            prescription_fee: rxFee,
            total_amount: totalAmount,
          })
          .eq("id", dbRecord.id);

        dbRecord.prescription_fee = rxFee;
        dbRecord.total_amount = totalAmount;
      }

      builtInvoices.push({
        ...dbRecord,
        patientName,
        startTime: apt.start_time || "",
        items: lineItems,
      });
    }

    setInvoices(builtInvoices);

    // If URL has :id param, select matching invoice; otherwise default to 0
    if (id) {
      const foundIdx = builtInvoices.findIndex(
        (inv) => inv.invoice_number === id || String(inv.id) === String(id),
      );
      setSelectedIndex(foundIdx >= 0 ? foundIdx : 0);
    } else {
      setSelectedIndex(0);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadPatientInvoices();
  }, [loadPatientInvoices]);

  const activeInvoice = invoices[selectedIndex] || null;

  const openPaymentModal = () => {
    setPaymentError("");
    setPaymentStep("input");
    setShowPayModal(true);
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (paymentMethod === "mpesa") {
      const cleaned = phoneNumber.replace(/\s+/g, "");
      if (!/^(07|01|\+2547|\+2541|2547|2541)\d{8}$/.test(cleaned)) {
        setPaymentError(
          "Please enter a valid Kenyan mobile number (e.g. 0712345678).",
        );
        return;
      }
    } else {
      if (
        !cardDetails.name.trim() ||
        cardDetails.number.replace(/\s+/g, "").length < 12 ||
        !cardDetails.expiry.trim() ||
        cardDetails.cvv.length < 3
      ) {
        setPaymentError("Please fill in all card details to proceed.");
        return;
      }
    }

    setPaymentStep("processing");

    // Simulate Safaricom Daraja STK Push / Card authorization delay (2.5 seconds)
    setTimeout(async () => {
      const receiptCode =
        paymentMethod === "mpesa"
          ? generateMpesaRef()
          : `CRD-${Math.floor(100000 + Math.random() * 900000)}`;

      const methodLabel =
        paymentMethod === "mpesa"
          ? `M-Pesa Express (${phoneNumber})`
          : `Card (•••• ${cardDetails.number.slice(-4) || "4242"})`;

      const paidTimestamp = new Date().toISOString();

      // Update Supabase invoices table
      if (activeInvoice && !String(activeInvoice.id).startsWith("local-")) {
        await supabase
          .from("invoices")
          .update({
            status: "PAID",
            payment_method: methodLabel,
            transaction_ref: receiptCode,
            paid_at: paidTimestamp,
          })
          .eq("id", activeInvoice.id);
      }

      // Update local state immediately
      setInvoices((prev) =>
        prev.map((inv, idx) =>
          idx === selectedIndex
            ? {
                ...inv,
                status: "PAID",
                payment_method: methodLabel,
                transaction_ref: receiptCode,
                paid_at: paidTimestamp,
              }
            : inv,
        ),
      );

      setLastReceiptRef(receiptCode);
      setPaymentStep("success");
    }, 2500);
  };

  if (loading) {
    return (
      <Layout>
        <div className="invoice-loading">Loading invoice details...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="invoice-container">
        {/* Top Action Bar */}
        <div className="invoice-header-actions">
          <button className="back-link" onClick={() => navigate("/dashboard")}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Dashboard
          </button>

          <div className="invoice-right-controls">
            {invoices.length > 1 && (
              <select
                className="invoice-select-dropdown"
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
              >
                {invoices.map((inv, idx) => (
                  <option key={inv.invoice_number} value={idx}>
                    #{inv.invoice_number} • {inv.service_date} ({inv.status})
                  </option>
                ))}
              </select>
            )}

            <button className="print-btn" onClick={() => window.print()}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print
            </button>
          </div>
        </div>

        {/* Empty State if Patient has no bookings yet */}
        {!activeInvoice ? (
          <div className="invoice-card" style={{ textAlign: "center" }}>
            <h2 style={{ margin: "0 0 8px", fontWeight: 500 }}>
              No Invoices Available
            </h2>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>
              Book an appointment to generate your consultation and prescription
              billing statement.
            </p>
            <button
              className="pay-now-btn"
              onClick={() => navigate("/book-appointment")}
            >
              Book Appointment
            </button>
          </div>
        ) : (
          /* Main Invoice Sheet */
          <div className="invoice-card">
            {/* Print-Only Clinic Brand Header */}
            <div className="print-clinic-banner">
              <div className="print-brand-mark">+ Turi. Healthcare</div>
              <span>Official Medical Receipt & Billing Statement</span>
            </div>

            <div className="invoice-top">
              <div>
                <h1 className="invoice-title">
                  {activeInvoice.status === "PAID" ? "Receipt" : "Invoice"}
                </h1>
                <p className="invoice-number">
                  #{activeInvoice.invoice_number}
                </p>
              </div>
              <div
                className={`invoice-status-badge ${
                  activeInvoice.status === "PAID" ? "paid" : "unpaid"
                }`}
              >
                {activeInvoice.status}
              </div>
            </div>

            <div className="invoice-meta">
              <div className="meta-block">
                <span className="meta-label">Billed To</span>
                <span className="meta-value">{activeInvoice.patientName}</span>
              </div>
              <div className="meta-block">
                <span className="meta-label">Provider</span>
                <span className="meta-value">{activeInvoice.doctor_name}</span>
              </div>
              <div className="meta-block">
                <span className="meta-label">Date of Service</span>
                <span className="meta-value">
                  {activeInvoice.service_date}
                  {activeInvoice.startTime
                    ? ` (${activeInvoice.startTime})`
                    : ""}
                </span>
              </div>
            </div>

            <div className="invoice-table-container">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.description}</td>
                      <td className="text-right">
                        KES{" "}
                        {Number(item.amount).toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-summary">
              <div className="summary-row total-row">
                <span>
                  {activeInvoice.status === "PAID" ? "Total Paid" : "Total Due"}
                </span>
                <span>
                  KES{" "}
                  {Number(activeInvoice.total_amount).toLocaleString("en-KE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="invoice-footer">
              {activeInvoice.status === "PAID" ? (
                <div className="paid-receipt-box">
                  <div className="paid-check-title">
                    ✓ Payment Confirmed & Recorded
                  </div>
                  <div className="paid-receipt-details">
                    <span>
                      <strong>Reference:</strong>{" "}
                      {activeInvoice.transaction_ref || "Confirmed"}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Method:</strong>{" "}
                      {activeInvoice.payment_method || "M-Pesa"}
                    </span>
                    {activeInvoice.paid_at && (
                      <>
                        <span>•</span>
                        <span>
                          <strong>Paid On:</strong>{" "}
                          {new Date(activeInvoice.paid_at).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button className="pay-now-btn" onClick={openPaymentModal}>
                    Pay KES{" "}
                    {Number(activeInvoice.total_amount).toLocaleString(
                      "en-KE",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}{" "}
                    Now
                  </button>
                  <p className="footer-note">
                    Payment is due within 30 days of the service date.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Simulated Payment Checkout Modal */}
      {showPayModal && activeInvoice && (
        <div
          className="payment-modal-overlay"
          onClick={() => {
            if (paymentStep !== "processing") setShowPayModal(false);
          }}
        >
          <div
            className="payment-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payment-modal-header">
              <div>
                <span className="modal-eyebrow">TURI SECURE CHECKOUT</span>
                <h3>Complete Payment</h3>
              </div>
              {paymentStep !== "processing" && (
                <button
                  className="modal-close-btn"
                  onClick={() => setShowPayModal(false)}
                >
                  ×
                </button>
              )}
            </div>

            <div className="modal-amount-banner">
              <span>Invoice #{activeInvoice.invoice_number}</span>
              <strong>
                KES{" "}
                {Number(activeInvoice.total_amount).toLocaleString("en-KE", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </div>

            {paymentStep === "input" && (
              <>
                {/* Method Switcher Tabs */}
                <div className="payment-method-tabs">
                  <button
                    type="button"
                    className={`method-tab ${
                      paymentMethod === "mpesa" ? "active" : ""
                    }`}
                    onClick={() => {
                      setPaymentMethod("mpesa");
                      setPaymentError("");
                    }}
                  >
                    M-Pesa Express (STK)
                  </button>
                  <button
                    type="button"
                    className={`method-tab ${
                      paymentMethod === "card" ? "active" : ""
                    }`}
                    onClick={() => {
                      setPaymentMethod("card");
                      setPaymentError("");
                    }}
                  >
                    Debit / Credit Card
                  </button>
                </div>

                {paymentError && (
                  <div className="payment-error-msg">{paymentError}</div>
                )}

                <form onSubmit={handleSimulatePayment}>
                  {paymentMethod === "mpesa" ? (
                    <div className="modal-form-body">
                      <label className="modal-label">
                        SAFARICOM M-PESA PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        className="modal-input"
                        placeholder="e.g. 0712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                      <p className="modal-security-note">
                        An M-Pesa STK prompt will be simulated. No PIN is
                        entered on this site and no real funds are deducted.
                      </p>
                    </div>
                  ) : (
                    <div className="modal-form-body">
                      <label className="modal-label">CARDHOLDER NAME</label>
                      <input
                        type="text"
                        className="modal-input"
                        placeholder="e.g. John Doe"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                      <label
                        className="modal-label"
                        style={{ marginTop: "12px" }}
                      >
                        CARD NUMBER
                      </label>
                      <input
                        type="text"
                        className="modal-input"
                        placeholder="4242 •••• •••• 4242"
                        maxLength={19}
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            number: e.target.value,
                          })
                        }
                        required
                      />
                      <div className="modal-form-row">
                        <div>
                          <label className="modal-label">EXPIRY</label>
                          <input
                            type="text"
                            className="modal-input"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                expiry: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="modal-label">CVV</label>
                          <input
                            type="password"
                            className="modal-input"
                            placeholder="•••"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                cvv: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="modal-submit-btn">
                    {paymentMethod === "mpesa"
                      ? `Send STK Push (KES ${Number(
                          activeInvoice.total_amount,
                        ).toLocaleString("en-KE")})`
                      : `Authorize KES ${Number(
                          activeInvoice.total_amount,
                        ).toLocaleString("en-KE")}`}
                  </button>
                </form>
              </>
            )}

            {paymentStep === "processing" && (
              <div className="payment-processing-state">
                <div className="stk-spinner"></div>
                <h4>
                  {paymentMethod === "mpesa"
                    ? "STK Push Sent to Handset..."
                    : "Verifying Card Authorization..."}
                </h4>
                <p>
                  {paymentMethod === "mpesa"
                    ? `Simulating M-Pesa PIN confirmation on ${phoneNumber}. Please wait...`
                    : "Communicating with payment gateway sandbox..."}
                </p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="payment-success-state">
                <div className="success-circle-check">✓</div>
                <h4>Payment Successful!</h4>
                <p>
                  Receipt Reference: <strong>{lastReceiptRef}</strong>
                </p>
                <button
                  type="button"
                  className="modal-submit-btn"
                  onClick={() => setShowPayModal(false)}
                >
                  View Paid Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
