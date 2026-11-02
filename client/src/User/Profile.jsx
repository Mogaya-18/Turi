import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });

  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Manage Profile</h2>
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        <label>Full Name
          <input type="text" value={profile.fullName} disabled style={{ width: '100%', padding: '8px' }} />
        </label>
        <label>Email
          <input type="email" value={profile.email} disabled style={{ width: '100%', padding: '8px' }} />
        </label>
        <label>Phone Number
          <input type="text" value={profile.phone} 
            onChange={(e) => setProfile({...profile, phone: e.target.value})} style={{ width: '100%', padding: '8px' }} />
        </label>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#2b5876', color: '#fff' }}>Save Changes</button>
      </form>
      <div style={{ marginTop: '20px' }}>
        <a href="/dashboard">Back to Dashboard</a>
      </div>
    </div>
  );
}