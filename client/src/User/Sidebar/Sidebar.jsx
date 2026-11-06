import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Book Appointment', path: '/book-appointment' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Consultation', path: '/consultation' },
    { name: 'Messages', path: '/messages', badge: 3 },
    { name: 'Health records', path: '/records' },
    { name: 'Invoices & Billing', path: '/invoices' },
    { name: 'Profile & Settings', path: '/profile' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand & Workspace Header */}
      <div className="sidebar-header">
        <div 
          className="brand-logo" 
          onClick={() => navigate('/dashboard')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="logo-icon">+</div>
          <h2>Cura.</h2>
        </div>
        
        <div className="workspace-dropdown">
          <div className="workspace-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="workspace-text">
            <span className="workspace-label">WORKSPACE</span>
            <span className="workspace-name">Patient portal</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        <span className="menu-heading">MENU</span>
        <nav className="menu-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path === '/invoices' && location.pathname.startsWith('/invoices'));
            return (
              <div 
                key={item.name} 
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <div className="menu-item-content">
                  <span className="menu-text">{item.name}</span>
                  {item.badge && <span className="menu-badge">{item.badge}</span>}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="sidebar-footer">
        <div 
          className="user-profile" 
          onClick={() => navigate('/profile')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="user-avatar">AH</div>
          <div className="user-info">
            <span className="user-name">Amelia Hart</span>
            <span className="user-role">Patient</span>
          </div>
        </div>
        <button className="sign-out-btn" onClick={() => navigate('/login')}>
          Sign out
        </button>
      </div>
    </aside>
  );
}