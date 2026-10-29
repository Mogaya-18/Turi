import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Registration successful! Please log in.');
        navigate('/login');
      } else {
        alert('Registration failed. Email might already exist.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Patient Registration</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Full Name" required 
          onChange={(e) => setFormData({...formData, fullName: e.target.value})} style={{ padding: '8px' }} />
        <input type="email" placeholder="Email" required 
          onChange={(e) => setFormData({...formData, email: e.target.value})} style={{ padding: '8px' }} />
        <input type="text" placeholder="Phone Number" 
          onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ padding: '8px' }} />
        <input type="password" placeholder="Password" required 
          onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ padding: '8px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#2b5876', color: '#fff' }}>Register</button>
      </form>
      <p style={{ marginTop: '10px' }}>Already have an account? <a href="/login">Log in here</a>.</p>
    </div>
  );
}