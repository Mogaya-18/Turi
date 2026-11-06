import React from 'react';
import './TopBar.css';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="search-container">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search patients, appointments..." 
          className="search-input" 
        />
      </div>
      
      <div className="topbar-actions">
        <div className="preview-selector">
          <span className="preview-label">Preview as</span>
          <div className="select-wrapper">
            <select className="preview-select">
              <option>Patient</option>
            </select>
          </div>
        </div>
        
        <button className="notification-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
}