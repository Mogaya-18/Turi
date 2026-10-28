import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    patientName: '',
    upcomingAppointment: null,
    activePrescriptions: [],
    billing: null,
    medicalHistory: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch patient dashboard data from backend server
    fetch('/api/patient/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading dashboard:', err);
        setLoading(false);
      });
  }, []);

  const handleRefillRequest = async (prescriptionId) => {
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}/refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        alert('Refill requested successfully!');
        // Update local state status
        setDashboardData((prev) => ({
          ...prev,
          activePrescriptions: prev.activePrescriptions.map((p) =>
            p.id === prescriptionId ? { ...p, status: 'refill_requested' } : p
          )
        }));
      }
    } catch (err) {
      console.error('Failed to request refill:', err);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Dashboard...</div>;

  const { patientName, upcomingAppointment, activePrescriptions, billing, medicalHistory } = dashboardData;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {patientName || '[Patient name]'}</h2>
        <a href="/book" style={{ padding: '10px 15px', backgroundColor: '#2b5876', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
          Book new appointment
        </a>
      </div>

      {/* Grid Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        
        {/* Upcoming Appointment */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px' }}>
          <h3>Upcoming appointment</h3>
          {upcomingAppointment ? (
            <>
              <p><strong>{upcomingAppointment.date}</strong> at <strong>{upcomingAppointment.time}</strong></p>
              <p>Dr. {upcomingAppointment.doctorName}, [{upcomingAppointment.specialization}]</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button style={{ padding: '6px 12px' }}>Reschedule</button>
                <button style={{ padding: '6px 12px' }}>Cancel</button>
              </div>
            </>
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>

        {/* Active Prescriptions */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px' }}>
          <h3>Active prescriptions</h3>
          {activePrescriptions.length > 0 ? (
            activePrescriptions.map((script) => (
              <div key={script.id} style={{ marginBottom: '12px' }}>
                <p style={{ margin: '0 0 5px 0' }}><strong>{script.medicineName}</strong>, {script.dosageInstructions}</p>
                <button 
                  onClick={() => handleRefillRequest(script.id)}
                  disabled={script.status === 'refill_requested'}
                  style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                >
                  {script.status === 'refill_requested' ? 'Refill Pending' : 'Request refill'}
                </button>
              </div>
            ))
          ) : (
            <p>No active prescriptions.</p>
          )}
        </div>

        {/* Billing */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px' }}>
          <h3>Billing</h3>
          {billing ? (
            <>
              <p>[Consultation date]: <strong>{billing.date}</strong></p>
              <p>Amount: <strong>${billing.amount}</strong></p>
              <p>Status: <strong>[{billing.status}]</strong></p>
              <button style={{ padding: '6px 12px', marginTop: '10px' }}>View details</button>
            </>
          ) : (
            <p>No pending billing records.</p>
          )}
        </div>
      </div>

      {/* Medical History Section */}
      <div style={{ marginTop: '30px' }}>
        <h3>Medical history and consultation notes</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Date</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Doctor</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Diagnosis</th>
              <th style={{ padding: '10px', border: '1px solid #ccc' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {medicalHistory.length > 0 ? (
              medicalHistory.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>{item.date}</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>{item.doctor}</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>{item.diagnosis}</td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                    <button style={{ padding: '4px 8px' }}>View</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>No prior medical history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}