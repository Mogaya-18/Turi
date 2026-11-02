import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Route based on role
        if (data.role === 'admin' || data.role === 'doctor') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Turi Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" placeholder="Email" required 
          onChange={(e) => setEmail(e.target.value)} style={{ padding: '8px' }} />
        <input type="password" placeholder="Password" required 
          onChange={(e) => setPassword(e.target.value)} style={{ padding: '8px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#2b5876', color: '#fff' }}>Log in</button>
      </form>
      <p style={{ marginTop: '10px' }}>New patient? <a href="/register">Register here</a>.</p>
    </div>
  );
}