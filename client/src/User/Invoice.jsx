import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Invoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    fetch(`/api/billing/${id}`)
      .then(res => res.json())
      .then(data => setInvoice(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!invoice) return <div style={{ padding: '20px' }}>Loading Invoice...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Invoice #{invoice.id}</h2>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '6px' }}>
        <p><strong>Consultation Date:</strong> {invoice.date}</p>
        <p><strong>Doctor:</strong> {invoice.doctorName}</p>
        <hr style={{ margin: '15px 0' }} />
        <table style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.description}</td>
                <td>${item.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr style={{ margin: '15px 0' }} />
        <h3>Total: ${invoice.total.toFixed(2)}</h3>
        <p>Status: <strong>{invoice.status}</strong></p>
        {invoice.status === 'Unpaid' && (
          <button style={{ padding: '10px 20px', backgroundColor: '#2b5876', color: '#fff', marginTop: '10px' }}>
            Pay Now
          </button>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/dashboard">Back to Dashboard</a>
      </div>
    </div>
  );
}