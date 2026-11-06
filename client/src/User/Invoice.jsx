import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import './Invoice.css';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mocking the fetch for demonstration. Replace with your actual API call.
  useEffect(() => {
    // fetch(`/api/invoices/${id}`)
    //   .then(res => res.json())
    //   .then(data => { setInvoice(data); setLoading(false); })
    
    // Simulating API response
    setTimeout(() => {
      setInvoice({
        id: id || "INV-802391",
        date: "May 22, 2026",
        status: "Unpaid",
        doctor: "Dr. Maya Chen",
        patient: "Amelia",
        items: [
          { description: "Video Consultation (30 min)", amount: 150.00 },
          { description: "Prescription Processing", amount: 25.00 }
        ],
        total: 175.00
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const handlePayment = () => {
    alert("Redirecting to payment gateway...");
    // navigate('/payment');
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
        <div className="invoice-header-actions">
          <button className="back-link" onClick={() => navigate('/dashboard')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Dashboard
          </button>
          <button className="print-btn" onClick={() => window.print()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
        </div>

        <div className="invoice-card">
          <div className="invoice-top">
            <div>
              <h1 className="invoice-title">Invoice</h1>
              <p className="invoice-number">#{invoice.id}</p>
            </div>
            <div className="invoice-status-badge">
              {invoice.status}
            </div>
          </div>

          <div className="invoice-meta">
            <div className="meta-block">
              <span className="meta-label">Billed To</span>
              <span className="meta-value">{invoice.patient}</span>
            </div>
            <div className="meta-block">
              <span className="meta-label">Provider</span>
              <span className="meta-value">{invoice.doctor}</span>
            </div>
            <div className="meta-block">
              <span className="meta-label">Date of Service</span>
              <span className="meta-value">{invoice.date}</span>
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
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td className="text-right">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-summary">
            <div className="summary-row total-row">
              <span>Total Due</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="invoice-footer">
            <button className="pay-now-btn" onClick={handlePayment}>
              Pay ${invoice.total.toFixed(2)} Now
            </button>
            <p className="footer-note">Payment is due within 30 days of the service date.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}