import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import './BookAppointment.css';

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
    <Layout>
      <div className="booking-container">
        <h1 className="booking-title">Book an appointment</h1>

        <div className="panels-wrapper">
          {/* Left Panel: Choose a doctor */}
          <div className="booking-panel">
            <h3 className="panel-heading">1. Choose a doctor</h3>
            
            <div className="form-group-list">
              <div className="form-group">
                <label>Specialization</label>
                <select 
                  value={selectedSpec} 
                  onChange={(e) => setSelectedSpec(e.target.value)}
                >
                  <option value="">[Select specialization]</option>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Doctor</label>
                <select 
                  value={selectedDoc} 
                  onChange={(e) => setSelectedDoc(e.target.value)}
                  disabled={!selectedSpec}
                >
                  <option value="">[Select doctor]</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Right Panel: Pick an available slot */}
          <div className="booking-panel gray-bg">
            <h3 className="panel-heading">2. Pick an available slot</h3>
            
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
                <div className="empty-slots-msg">
                  Select a doctor and date to view slots.
                </div>
              )}
            </div>

            <p className="slots-helper-text">
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
    </Layout>
  );
}