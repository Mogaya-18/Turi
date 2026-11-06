import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import './EmptyState.css';

export default function Appointments() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="empty-state-wrapper">
        <div className="empty-state-icon-box">
          {/* Clipboard Icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#007a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M9 14h6"></path>
            <path d="M9 10h6"></path>
            <path d="M9 18h6"></path>
          </svg>
        </div>
        
        <h2 className="empty-state-title">Appointments</h2>
        <p className="empty-state-desc">This polished prototype keeps the selected area ready for the next workflow.</p>
        
        <button className="back-overview-btn" onClick={() => navigate('/dashboard')}>
          Back to overview
        </button>
      </div>
    </Layout>
  );
}