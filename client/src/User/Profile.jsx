import React, { useState } from 'react';
import Layout from './Layout/Layout';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: 'Amelia Hart',
    email: 'amelia.hart@example.com',
    phone: '+1 (555) 234-5678',
    dob: '1992-05-14',
    bloodType: 'A+',
    allergies: 'Penicillin, Peanuts',
    emergencyContact: 'John Hart (Spouse) - +1 (555) 987-6543'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({ ...formData });
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <h1 className="profile-title">Patient Profile</h1>
            <p className="profile-subtitle">Manage your personal information and health details</p>
          </div>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <button className="cancel-edit-btn" onClick={() => { setFormData({ ...profile }); setIsEditing(false); }}>
              Cancel
            </button>
          )}
        </div>

        <div className="profile-card">
          <div className="profile-hero">
            <div className="profile-avatar-large">AH</div>
            <div className="profile-hero-info">
              <h2>{profile.fullName}</h2>
              <span className="patient-id-tag">Patient ID: #PR-4092</span>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="profile-section">
              <h3 className="section-title">Personal Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>
            </div>

            <hr className="profile-divider" />

            <div className="profile-section">
              <h3 className="section-title">Medical Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Blood Type</label>
                  <input 
                    type="text" 
                    name="bloodType" 
                    value={formData.bloodType} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                  />
                </div>
                <div className="form-group">
                  <label>Known Allergies</label>
                  <input 
                    type="text" 
                    name="allergies" 
                    value={formData.allergies} 
                    onChange={handleChange} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>
            </div>

            <hr className="profile-divider" />

            <div className="profile-section">
              <h3 className="section-title">Emergency Contact</h3>
              <div className="form-group full-width">
                <label>Contact Info</label>
                <input 
                  type="text" 
                  name="emergencyContact" 
                  value={formData.emergencyContact} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                />
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}