import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [refillStatuses, setRefillStatuses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch dashboard data from our Node backend
    fetch('/api/patient/dashboard')
      .then((res) => res.json())
      .then((fetchedData) => setData(fetchedData))
      .catch((err) => console.error("Error fetching dashboard:", err));
  }, []);

  // Button Handlers
  const handleLogOut = () => navigate('/login');
  
  const handleBookNew = () => navigate('/book');
  
  const handleCancelAppointment = () => {
    if(window.confirm("Are you sure you want to cancel this appointment?")) {
      // In a real app, send DELETE request to backend here
      setData(prev => ({ ...prev, upcomingAppointment: null }));
      alert("Appointment cancelled.");
    }
  };

  const handleRequestRefill = async (prescriptionId) => {
    try {
      const res = await fetch(`/api/prescriptions/${prescriptionId}/refill`, { method: 'POST' });
      if (res.ok) {
        setRefillStatuses(prev => ({ ...prev, [prescriptionId]: 'Requested' }));
      }
    } catch (err) {
      console.error("Refill error:", err);
    }
  };

  const handleViewInvoice = () => {
    // Navigate to the generic invoice route we created earlier
    navigate('/invoice/1');
  };

  if (!data) return <div style={{ padding: '20px' }}>Loading dashboard...</div>;

  return (
    <>
      <style>
        {`
          .dashboard-container {
            font-family: sans-serif;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 15px 40px 15px;
          }
          /* Navbar */
          .nav-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 2px solid #333;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
          }
          .nav-left {
            display: flex;
            gap: 20px;
            align-items: center;
            flex-wrap: wrap;
          }
          .nav-logo { margin: 0; font-size: 20px; font-weight: bold; }
          .nav-links {
            display: flex;
            gap: 15px;
            color: #555;
            font-size: 14px;
            flex-wrap: wrap;
          }
          .nav-link { cursor: pointer; }
          .nav-link.active { font-weight: bold; color: #000; }
          
          /* Header Section */
          .header-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 15px;
          }
          .welcome-text { font-size: 28px; margin: 0; }
          .book-btn {
            background-color: #386386;
            color: #fff;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
          }
          .book-btn:hover { background-color: #2c4d68; }
          
          /* Cards Section */
          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
          }
          .card {
            border: 1px solid #333;
            border-radius: 6px;
            padding: 20px;
            background-color: #f9f9f9;
            display: flex;
            flex-direction: column;
          }
          .card h3 { margin: 0 0 15px 0; font-size: 16px; }
          .card-content { flex-grow: 1; font-size: 14px; color: #333; line-height: 1.5; }
          
          /* Outline Buttons */
          .outline-btn {
            background-color: transparent;
            color: #386386;
            border: 1px solid #386386;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            margin-top: 15px;
            margin-right: 10px;
            transition: background-color 0.2s;
          }
          .outline-btn:hover:not(:disabled) { background-color: #e0eaf5; }
          .outline-btn:disabled { border-color: #aaa; color: #aaa; cursor: not-allowed; }
          
          /* Table Section */
          .table-title { font-size: 18px; margin-bottom: 15px; font-weight: bold; }
          .history-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          .history-table th, .history-table td {
            border: 1px solid #ccc;
            padding: 12px 15px;
            text-align: left;
          }
          .history-table th { background-color: #fff; font-weight: bold; }
          .view-link {
            color: #333;
            text-decoration: underline;
            cursor: pointer;
          }
        `}
      </style>

      <div className="dashboard-container">
        {/* Navigation Bar */}
        <nav className="nav-bar">
          <div className="nav-left">
            <h2 className="nav-logo">Turi</h2>
            <div className="nav-links">
              <span className="nav-link active">Dashboard</span>
              <span className="nav-link" onClick={() => navigate('/book')}>Appointments</span>
              <span className="nav-link">Records</span>
              <span className="nav-link">Prescriptions</span>
              <span className="nav-link">Billing</span>
            </div>
          </div>
          <div style={{ fontSize: '14px', cursor: 'pointer', color: '#555' }} onClick={handleLogOut}>
            Log out
          </div>
        </nav>

        {/* Header */}
        <div className="header-section">
          <h1 className="welcome-text">Welcome, {data.patientName}</h1>
          <button className="book-btn" onClick={handleBookNew}>Book new appointment</button>
        </div>

        {/* Info Cards Grid */}
        <div className="cards-grid">
          
          {/* 1. Upcoming Appointment Card */}
          <div className="card">
            <h3>Upcoming appointment</h3>
            <div className="card-content">
              {data.upcomingAppointment ? (
                <>
                  <div>{data.upcomingAppointment.date} at {data.upcomingAppointment.time}</div>
                  <div>Dr. {data.upcomingAppointment.doctorName}, {data.upcomingAppointment.specialization}</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="outline-btn" onClick={handleBookNew}>Reschedule</button>
                    <button className="outline-btn" onClick={handleCancelAppointment}>Cancel</button>
                  </div>
                </>
              ) : (
                <div style={{ color: '#666', marginTop: '10px' }}>No upcoming appointments.</div>
              )}
            </div>
          </div>

          {/* 2. Active Prescriptions Card */}
          <div className="card">
            <h3>Active prescriptions</h3>
            <div className="card-content">
              {data.activePrescriptions && data.activePrescriptions.length > 0 ? (
                data.activePrescriptions.map(rx => (
                  <div key={rx.id} style={{ marginBottom: '15px' }}>
                    <div>{rx.medicineName}, {rx.dosageInstructions}</div>
                    <button 
                      className="outline-btn"
                      onClick={() => handleRequestRefill(rx.id)}
                      disabled={refillStatuses[rx.id] === 'Requested'}
                    >
                      {refillStatuses[rx.id] === 'Requested' ? 'Refill Requested' : 'Request refill'}
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ color: '#666' }}>No active prescriptions.</div>
              )}
            </div>
          </div>

          {/* 3. Billing Card */}
          <div className="card">
            <h3>Billing</h3>
            <div className="card-content">
              {data.billing ? (
                <>
                  <div>{data.billing.date}: ${data.billing.amount.toFixed(2)}</div>
                  <div>Status: {data.billing.status}</div>
                  <button className="outline-btn" onClick={handleViewInvoice}>View details</button>
                </>
              ) : (
                <div style={{ color: '#666' }}>No recent billing activity.</div>
              )}
            </div>
          </div>
        </div>

        {/* Medical History Table */}
        <h2 className="table-title">Medical history and consultation notes</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Doctor</th>
                <th>Diagnosis</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {data.medicalHistory && data.medicalHistory.length > 0 ? (
                data.medicalHistory.map((history, idx) => (
                  <tr key={idx}>
                    <td>{history.date}</td>
                    <td>{history.doctor}</td>
                    <td>{history.diagnosis}</td>
                    <td>
                      <span 
                        className="view-link"
                        onClick={() => alert(`Consultation Notes:\n${history.notes}`)}
                      >
                        View
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>No past records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}