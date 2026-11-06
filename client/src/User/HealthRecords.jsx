import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import './EmptyState.css';

export default function HealthRecords() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="empty-state-wrapper">
        <div className="empty-state-icon-box">
          {/* Medical Records Icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#007a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        
        <h2 className="empty-state-title">Health records</h2>
        <p className="empty-state-desc">This polished prototype keeps the selected area ready for the next workflow.</p>
        
        <button className="back-overview-btn" onClick={() => navigate('/dashboard')}>
          Back to overview
        </button>
      </div>
    </Layout>
  );
}