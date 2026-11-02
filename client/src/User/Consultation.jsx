import React, { useState, useEffect } from 'react';

export default function Consultation() {
  const [patientInfo, setPatientInfo] = useState({ name: '', age: '', gender: '', appointmentTime: '' });
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  
  const [pharmacyItems, setPharmacyItems] = useState([]);
  const [prescriptions, setPrescriptions] = useState([
    { medicineId: '', dosage: '', frequency: '', days: '' }
  ]);

  useEffect(() => {
    // Fetch active session / patient details[cite: 1]
    fetch('/api/consultations/current')
      .then((res) => res.json())
      .then((data) => setPatientInfo(data))
      .catch((err) => console.error(err));

    // Fetch medication inventory for selector dropdowns[cite: 1]
    fetch('/api/pharmacy/inventory')
      .then((res) => res.json())
      .then((data) => setPharmacyItems(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddMedication = () => {
    setPrescriptions([...prescriptions, { medicineId: '', dosage: '', frequency: '', days: '' }]);
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleSaveConsultation = async (issuePrescription = false) => {
    const payload = {
      notes,
      diagnosis,
      prescriptions: issuePrescription ? prescriptions : [],
      issueNow: issuePrescription
    };

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert(issuePrescription ? 'Consultation & Prescription Issued!' : 'Consultation Saved!');
      }
    } catch (err) {
      console.error('Error saving consultation:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Patient Overview Header[cite: 1] */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
        <h3>
          [{patientInfo.name || 'Patient Name'}], [{patientInfo.age || 'Age'}], [{patientInfo.gender || 'Gender'}] | Appointment [{patientInfo.appointmentTime || 'Time'}]
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Clinical Inputs[cite: 1] */}
        <div>
          <h3>Consultation</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Consultation notes</label>
            <textarea
              rows="6"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="[Enter notes]"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Clinical diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="[Enter diagnosis]"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>

        {/* Digital Prescription Table[cite: 1] */}
        <div>
          <h3>Digital prescription</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4' }}>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Medication</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Dosage</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Frequency</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Days</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '5px', border: '1px solid #ccc' }}>
                    <select
                      value={item.medicineId}
                      onChange={(e) => handlePrescriptionChange(index, 'medicineId', e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="">[Select]</option>
                      {pharmacyItems.map((med) => (
                        <option key={med.id} value={med.id}>{med.medicineName}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '5px', border: '1px solid #ccc' }}>
                    <input
                      type="text"
                      value={item.dosage}
                      onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                      style={{ width: '90%' }}
                    />
                  </td>
                  <td style={{ padding: '5px', border: '1px solid #ccc' }}>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                      style={{ width: '90%' }}
                    />
                  </td>
                  <td style={{ padding: '5px', border: '1px solid #ccc' }}>
                    <input
                      type="number"
                      value={item.days}
                      onChange={(e) => handlePrescriptionChange(index, 'days', e.target.value)}
                      style={{ width: '90%' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleAddMedication}
            style={{ marginTop: '10px', padding: '6px 12px' }}
          >
            Add medication
          </button>
        </div>

      </div>

      {/* Action Footer[cite: 1] */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
        <button
          onClick={() => handleSaveConsultation(false)}
          style={{ padding: '10px 20px', backgroundColor: '#2b5876', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Save consultation
        </button>
        <button
          onClick={() => handleSaveConsultation(true)}
          style={{ padding: '10px 20px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Issue prescription
        </button>
        <button
          onClick={() => { setNotes(''); setDiagnosis(''); }}
          style={{ padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          Discard
        </button>
      </div>
    </div>
  );
}