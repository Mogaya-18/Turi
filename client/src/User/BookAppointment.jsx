import React, { useState, useEffect } from 'react';

export default function BookAppointment() {
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState(null);

  // Load specializations on mount
  useEffect(() => {
    fetch('/api/doctors/specializations')
      .then((res) => res.json())
      .then((data) => setSpecializations(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch doctors when specialization changes
  useEffect(() => {
    if (selectedSpec) {
      fetch(`/api/doctors?specialization=${selectedSpec}`)
        .then((res) => res.json())
        .then((data) => setDoctors(data));
    }
  }, [selectedSpec]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetch(`/api/slots?doctorId=${selectedDoctor}&date=${selectedDate}`)
        .then((res) => res.json())
        .then((data) => setSlots(data));
    }
  }, [selectedDoctor, selectedDate]);

  const handleBooking = async () => {
    if (!selectedSlotId) {
      alert('Please select a time slot.');
      return;
    }

    try {
      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlotId })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Appointment booked successfully!');
        window.location.href = '/dashboard';
      } else {
        alert(data.message || 'Slot taken, retry.');
        // Refresh available slots
        fetch(`/api/slots?doctorId=${selectedDoctor}&date=${selectedDate}`)
          .then((r) => r.json())
          .then((d) => setSlots(d));
      }
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Book an appointment</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Step 1: Selection Form */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '6px' }}>
          <h3>1. Choose a doctor</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Specialization</label>
            <select 
              value={selectedSpec} 
              onChange={(e) => setSelectedSpec(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">[Select specialization]</option>
              {specializations.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Doctor</label>
            <select 
              value={selectedDoctor} 
              onChange={(e) => setSelectedDoctor(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">[Select doctor]</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>Dr. {d.fullName}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>

        {/* Step 2: Available Slots Grid */}
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '6px' }}>
          <h3>2. Pick an available slot</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '15px' }}>
            {slots.length > 0 ? (
              slots.map((slot) => {
                const isBooked = slot.isBooked;
                const isSelected = selectedSlotId === slot.id;

                return (
                  <button
                    key={slot.id}
                    disabled={isBooked}
                    onClick={() => setSelectedSlotId(slot.id)}
                    style={{
                      padding: '12px',
                      textDecoration: isBooked ? 'line-through' : 'none',
                      border: isSelected ? '2px solid #0056b3' : '1px solid #ccc',
                      backgroundColor: isBooked ? '#e0e0e0' : isSelected ? '#e6f0fa' : '#fff',
                      cursor: isBooked ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {slot.time}
                  </button>
                );
              })
            ) : (
              <p style={{ gridColumn: 'span 4' }}>Select a doctor and date to view slots.</p>
            )}
          </div>
          
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '15px' }}>
            Struck-through slots are already booked.
          </p>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleBooking} 
              style={{ padding: '10px 20px', backgroundColor: '#2b5876', color: '#fff', border: 'none', borderRadius: '4px' }}
            >
              Confirm appointment
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{ padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}