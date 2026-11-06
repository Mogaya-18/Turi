import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Welcome Header Section */}
      <div className="dashboard-header">
        <div className="header-text">
          <span className="subtitle-green">YOUR CARE, ALL IN ONE PLACE</span>
          <h1 className="greeting-title">Good morning, Amelia.</h1>
          <p className="greeting-sub">Here's what's happening with your care.</p>
        </div>
        <button 
          className="book-appt-btn" 
          onClick={() => navigate('/book-appointment')}
        >
          Book appointment
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="dashboard-grid">
        
        {/* Card 1: Next Appointment */}
        <div className="dash-card next-appt-card">
          <div className="card-top">
            <span className="card-kicker">NEXT APPOINTMENT</span>
            <span className="status-badge">Confirmed</span>
          </div>
          
          <h2 className="appt-title">Video visit with Dr. Maya Chen</h2>
          
          <div className="appt-details-box">
            <div className="date-block">
              <span className="date-day">22</span>
              <span className="date-month">MAY</span>
            </div>
            
            <div className="time-block">
              <div className="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007a5a" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>9:30–10:00 AM</span>
              </div>
              <div className="info-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007a5a" strokeWidth="2">
                  <path d="M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <span>Online consultation</span>
              </div>
            </div>

            <button className="join-visit-btn">
              Join visit
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </button>
          </div>
        </div>

        {/* Card 2: Your Care Team */}
        <div className="dash-card care-team-card">
          <div className="card-top">
            <h3>Your care team</h3>
            <span className="text-link">View all</span>
          </div>
          
          <div className="provider-profile">
            <div className="provider-avatar">
               <img src="https://i.pravatar.cc/150?img=47" alt="Dr. Maya Chen" />
            </div>
            <div className="provider-info">
              <h4>Dr. Maya Chen</h4>
              <p className="provider-role">Primary care physician</p>
              <div className="provider-status">
                <span className="status-dot"></span>
                <span>Usually replies in 1 hour</span>
              </div>
            </div>
            <button className="message-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007a5a" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Card 3: Health Snapshot */}
        <div className="dash-card health-snapshot-card">
          <div className="card-top">
            <h3>Health snapshot</h3>
            <span className="text-link">View records</span>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Blood pressure</span>
              <div className="metric-value">118/76</div>
              <span className="metric-context">Normal range</span>
            </div>
            <div className="metric-divider"></div>
            
            <div className="metric-item">
              <span className="metric-label">Resting heart rate</span>
              <div className="metric-value">68 <span className="unit">bpm</span></div>
              <span className="metric-context">Last updated May 12</span>
            </div>
            <div className="metric-divider"></div>
            
            <div className="metric-item">
              <span className="metric-label">Next checkup</span>
              <div className="metric-value">6 <span className="unit">months</span></div>
              <span className="metric-context">November 2025</span>
            </div>
          </div>
        </div>

        {/* Card 4: For You (Tasks) */}
        <div className="dash-card tasks-card">
          <div className="card-top">
            <h3>For you</h3>
            <span className="item-count">2 items</span>
          </div>
          
          <div className="task-list">
            <div className="task-item">
              <input type="checkbox" className="task-checkbox" />
              <div className="task-text">
                <h4>Complete your pre-visit form</h4>
                <p>Due before May 22</p>
              </div>
            </div>
            
            <hr className="task-divider" />
            
            <div className="task-item">
              <input type="checkbox" className="task-checkbox" />
              <div className="task-text">
                <h4>Upload insurance card</h4>
                <p>Takes about 2 minutes</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}