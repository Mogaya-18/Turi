import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'notes' | 'prescriptions'

  // Data states
  const [appointments, setAppointments] = useState([
    { id: 101, patientName: "Amelia Hart", time: "09:00 AM", status: "Checked In", reason: "Annual Cardiovascular Checkup", age: 34, gender: "Female" },
    { id: 102, patientName: "Robert Vance", time: "10:30 AM", status: "Confirmed", reason: "Hypertension Follow-up", age: 52, gender: "Male" },
    { id: 103, patientName: "Elena Rostova", time: "01:15 PM", status: "Pending", reason: "Routine Blood Work Review", age: 29, gender: "Female" },
  ]);

  const [inventory, setInventory] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(appointments[0]);

  // Consultation Note Form State
  const [consultation, setConsultation] = useState({
    chiefComplaint: '',
    diagnosis: '',
    clinicalNotes: ''
  });

  // Prescription Form State
  const [prescription, setPrescription] = useState({
    medicineName: '',
    dosage: '',
    frequency: 'Once daily',
    duration: '7 days',
    instructions: ''
  });

  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch pharmacy inventory on mount
  useEffect(() => {
    fetch('/api/pharmacy/inventory')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInventory(data);
      })
      .catch(err => console.error('Error fetching inventory:', err));
  }, []);

  const handleAddPrescriptionItem = (e) => {
    e.preventDefault();
    if (!prescription.medicineName) return;

    setPrescriptionsList(prev => [...prev, { ...prescription, id: Date.now() }]);
    setPrescription({
      medicineName: '',
      dosage: '',
      frequency: 'Once daily',
      duration: '7 days',
      instructions: ''
    });
  };

  const handleRemovePrescription = (id) => {
    setPrescriptionsList(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveConsultation = async (issueNow = false) => {
    setStatusMessage('');
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          patientName: selectedPatient.patientName,
          notes: consultation.clinicalNotes,
          diagnosis: consultation.diagnosis,
          chiefComplaint: consultation.chiefComplaint,
          prescriptions: prescriptionsList,
          issueNow
        })
      });

      const data = await response.json();
      if (response.ok) {
        setStatusMessage(data.message || 'Consultation record saved successfully!');
        if (issueNow) {
          setPrescriptionsList([]);
          setConsultation({ chiefComplaint: '', diagnosis: '', clinicalNotes: '' });
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to save consultation details.');
    }
  };

  return (
    <div className="doctor-shell">
      {/* Top Header */}
      <header className="doctor-header">
        <div className="header-brand">
          <div className="brand-badge">+</div>
          <div>
            <h1>Dr. Maya Chen</h1>
            <span className="specialty-tag">Cardiology Specialist • MD-90412</span>
          </div>
        </div>

        <button className="doctor-logout-btn" onClick={() => navigate('/login')}>
          Sign out
        </button>
      </header>

      {/* Main Container */}
      <div className="doctor-body">
        {/* Navigation Tabs */}
        <div className="doctor-tabs">
          <button 
            className={`tab-link ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments Queue
          </button>
          <button 
            className={`tab-link ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Consultation & Notes
          </button>
          <button 
            className={`tab-link ${activeTab === 'prescriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('prescriptions')}
          >
            Rx & Prescriptions ({prescriptionsList.length})
          </button>
        </div>

        {statusMessage && (
          <div className="doctor-alert-success">
            <span>✓ {statusMessage}</span>
            <button onClick={() => setStatusMessage('')}>×</button>
          </div>
        )}

        {/* --- TAB 1: APPOINTMENTS QUEUE --- */}
        {activeTab === 'appointments' && (
          <div className="doctor-card">
            <div className="card-heading-row">
              <div>
                <h2>Today's Appointments</h2>
                <p>Manage scheduled patient consultations</p>
              </div>
              <span className="count-badge">{appointments.length} Total</span>
            </div>

            <table className="doctor-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient Name</th>
                  <th>Demographics</th>
                  <th>Reason for Visit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className={selectedPatient.id === apt.id ? 'active-row' : ''}>
                    <td><strong>{apt.time}</strong></td>
                    <td>
                      <div className="patient-name-cell">
                        <div className="avatar-circle">{apt.patientName.charAt(0)}</div>
                        <span>{apt.patientName}</span>
                      </div>
                    </td>
                    <td>{apt.age} yrs • {apt.gender}</td>
                    <td>{apt.reason}</td>
                    <td>
                      <span className={`status-pill ${apt.status.toLowerCase().replace(' ', '-')}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-select-patient"
                        onClick={() => {
                          setSelectedPatient(apt);
                          setActiveTab('notes');
                        }}
                      >
                        Start Consultation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB 2: CONSULTATION & CLINICAL NOTES --- */}
        {activeTab === 'notes' && (
          <div className="consultation-grid">
            {/* Active Patient Card */}
            <div className="doctor-card patient-summary-card">
              <span className="card-kicker">ACTIVE PATIENT</span>
              <h3>{selectedPatient.patientName}</h3>
              <p className="patient-meta">ID: #{selectedPatient.id} • {selectedPatient.age} Yrs • {selectedPatient.gender}</p>
              
              <div className="visit-reason-box">
                <label>Reason for Visit</label>
                <span>{selectedPatient.reason}</span>
              </div>

              <div className="patient-switcher">
                <label>Switch Patient:</label>
                <select 
                  value={selectedPatient.id} 
                  onChange={(e) => {
                    const found = appointments.find(a => a.id === Number(e.target.value));
                    if (found) setSelectedPatient(found);
                  }}
                >
                  {appointments.map(a => (
                    <option key={a.id} value={a.id}>{a.patientName} ({a.time})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes Form */}
            <div className="doctor-card notes-form-card">
              <h2>Clinical Notes & Diagnosis</h2>

              <div className="form-group">
                <label>Chief Complaint</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chest tightness, shortness of breath on exertion"
                  value={consultation.chiefComplaint}
                  onChange={(e) => setConsultation({...consultation, chiefComplaint: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Diagnosis / Assessment</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mild Hypertension, Essential"
                  value={consultation.diagnosis}
                  onChange={(e) => setConsultation({...consultation, diagnosis: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Detailed Clinical Notes</label>
                <textarea 
                  rows="6"
                  placeholder="Record patient history, physical examination findings, recommendations..."
                  value={consultation.clinicalNotes}
                  onChange={(e) => setConsultation({...consultation, clinicalNotes: e.target.value})}
                ></textarea>
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setActiveTab('prescriptions')}>
                  Proceed to Issue Rx →
                </button>
                <button className="btn-primary" onClick={() => handleSaveConsultation(false)}>
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: ISSUE PRESCRIPTION --- */}
        {activeTab === 'prescriptions' && (
          <div className="consultation-grid">
            {/* Add Medication Form */}
            <div className="doctor-card">
              <h2>Add Prescription Item</h2>
              <p className="card-subtitle">Prescribing for: <strong>{selectedPatient.patientName}</strong></p>

              <form onSubmit={handleAddPrescriptionItem} className="rx-form">
                <div className="form-group">
                  <label>Select Medication (Pharmacy Stock)</label>
                  <select 
                    value={prescription.medicineName}
                    onChange={(e) => setPrescription({...prescription, medicineName: e.target.value})}
                    required
                  >
                    <option value="">-- Choose Medication --</option>
                    {inventory.map(med => (
                      <option key={med.id} value={med.medicineName}>
                        {med.medicineName} (Stock: {med.stock} | ${med.unitPrice.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Dosage</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 500mg or 1 tablet" 
                      value={prescription.dosage}
                      onChange={(e) => setPrescription({...prescription, dosage: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Frequency</label>
                    <select 
                      value={prescription.frequency}
                      onChange={(e) => setPrescription({...prescription, frequency: e.target.value})}
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="As needed (PRN)">As needed (PRN)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Instructions & Duration</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Take after meals with full glass of water for 7 days" 
                    value={prescription.instructions}
                    onChange={(e) => setPrescription({...prescription, instructions: e.target.value})}
                  />
                </div>

                <button type="submit" className="btn-secondary full-width">
                  + Add to Prescription Sheet
                </button>
              </form>
            </div>

            {/* Current Rx Sheet */}
            <div className="doctor-card">
              <h2>Prescription Summary Sheet</h2>
              
              {prescriptionsList.length === 0 ? (
                <div className="rx-empty-state">
                  <p>No medications added to this prescription yet.</p>
                </div>
              ) : (
                <div className="rx-list">
                  {prescriptionsList.map((item, idx) => (
                    <div key={item.id} className="rx-item">
                      <div className="rx-info">
                        <h4>{idx + 1}. {item.medicineName}</h4>
                        <p>{item.dosage} • {item.frequency}</p>
                        {item.instructions && <span className="rx-note">{item.instructions}</span>}
                      </div>
                      <button className="btn-delete" onClick={() => handleRemovePrescription(item.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rx-footer-actions">
                <button 
                  className="btn-primary full-width"
                  disabled={prescriptionsList.length === 0}
                  onClick={() => handleSaveConsultation(true)}
                >
                  Finalize & Send Rx to Pharmacy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}