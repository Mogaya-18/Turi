import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

export default function BookAppointment() {
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const navigate = useNavigate(); 

  useEffect(() => {
    fetch('/api/doctors/specializations')
      .then(res => res.json())
      .then(data => setSpecializations(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedSpec) {
      fetch(`/api/doctors?specialization=${selectedSpec}`)
        .then(res => res.json())
        .then(data => setDoctors(data))
        .catch(err => console.error(err));
    }
  }, [selectedSpec]);

  useEffect(() => {
    if (selectedDoc && selectedDate) {
      fetch('/api/slots')
        .then(res => res.json())
        .then(data => setSlots(data))
        .catch(err => console.error(err));
    }
  }, [selectedDoc, selectedDate]);

  const handleConfirm = async () => {
    if (!selectedSlot) return alert("Please select a slot");
    try {
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot })
      });
      if (res.status === 409) {
        alert("Slot taken, retry.");
      } else if (res.ok) {
        alert("Appointment confirmed!");
        navigate('/dashboard'); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>
        {`
          .responsive-container {
            font-family: sans-serif;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 15px;
          }
          .panels-wrapper {
            display: flex;
            gap: 20px;
            align-items: stretch;
          }
          .slots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(85px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .slot-btn {
            padding: 12px 10px;
            font-size: 14px;
            border-radius: 4px;
            border: 1px solid #666;
            background-color: #fff;
            color: #333;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            width: 100%; 
          }
          .slot-btn:hover:not(:disabled) {
            border-color: #386386;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .slot-btn.selected {
            background-color: #e0eaf5;
            border-color: #386386;
          }
          .slot-btn:disabled {
            border: 1px dashed #aaa;
            color: #aaa;
            background-color: transparent;
            text-decoration: line-through;
            cursor: not-allowed;
          }
          .action-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap; 
          }
          .confirm-btn {
            background-color: #386386;
            color: #fff;
            border: none;
            padding: 12px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s ease;
            flex: 1 1 auto; 
          }
          .confirm-btn:hover {
            background-color: #2c4d68;
          }
          .cancel-btn {
            background-color: #fff;
            color: #386386;
            border: 1px solid #386386;
            padding: 12px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s ease;
            flex: 1 1 auto;
          }
          .cancel-btn:hover {
            background-color: #f4f6f8;
          }
          @media (max-width: 768px) {
            .panels-wrapper {
              flex-direction: column;
            }
          }
        `}
      </style>

      <div className="responsive-container">
        {/* Navigation Bar */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '2px solid #333', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Turi</h2>
            <div style={{ display: 'flex', gap: '15px', color: '#555', fontSize: '14px', flexWrap: 'wrap' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
              <span style={{ cursor: 'pointer', fontWeight: 'bold', color: '#000' }}>Appointments</span>
              <span style={{ cursor: 'pointer' }}>Records</span>
              <span style={{ cursor: 'pointer' }}>Prescriptions</span>
              <span style={{ cursor: 'pointer' }}>Billing</span>
            </div>
          </div>
          <div 
            style={{ fontSize: '14px', cursor: 'pointer', color: '#555' }} 
            onClick={() => navigate('/login')}
          >
            Log out
          </div>
        </nav>

        <h1 style={{ fontSize: '28px', marginBottom: '25px' }}>Book an appointment</h1>

        <div className="panels-wrapper">
          {/* Left Panel: Choose a doctor */}
          <div style={{ flex: '1', border: '1px solid #ccc', borderRadius: '4px', padding: '25px', backgroundColor: '#fff' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>1. Choose a doctor</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555' }}>Specialization</label>
                <select 
                  value={selectedSpec} 
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                >
                  <option value="">[Select specialization]</option>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555' }}>Doctor</label>
                <select 
                  value={selectedDoc} 
                  onChange={(e) => setSelectedDoc(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                  disabled={!selectedSpec}
                >
                  <option value="">[Select doctor]</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555' }}>Date</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Pick an available slot */}
          <div style={{ flex: '1.5', border: '1px solid #ccc', borderRadius: '4px', padding: '25px', backgroundColor: '#f4f6f8' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>2. Pick an available slot</h3>
            
            <div className="slots-grid">
              {slots.length > 0 ? slots.map(slot => (
                <button
                  key={slot.id}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`slot-btn ${selectedSlot === slot.id ? 'selected' : ''}`}
                >
                  {slot.time}
                </button>
              )) : (
                <div style={{ gridColumn: '1 / -1', color: '#888', fontSize: '14px' }}>
                  Select a doctor and date to view slots.
                </div>
              )}
            </div>

            <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
              Struck-through slots are already booked.
            </p>

            <div className="action-buttons">
              <button onClick={handleConfirm} className="confirm-btn">
                Confirm appointment
              </button>
              <button className="cancel-btn" onClick={() => navigate('/dashboard')}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}