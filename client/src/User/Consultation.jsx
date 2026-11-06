import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';
import './Consultation.css';

export default function Consultation() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleEndCall = () => {
    if (window.confirm("Are you sure you want to end the consultation?")) {
      navigate('/dashboard');
    }
  };

  return (
    <Layout>
      <div className="consultation-container">
        <div className="consultation-header">
          <div>
            <h1 className="consultation-title">Video Consultation</h1>
            <p className="consultation-subtitle">Dr. Maya Chen • Primary Care Physician</p>
          </div>
          <div className="call-status">
            <span className="status-dot pulsing"></span>
            Live (12:45)
          </div>
        </div>

        <div className="consultation-layout">
          {/* Main Video Area */}
          <div className="video-section">
            <div className="main-video-feed">
              {/* Placeholder for Doctor's Video */}
              <div className="video-placeholder doctor-video">
                <img src="https://i.pravatar.cc/300?img=47" alt="Dr. Maya Chen" className="doctor-avatar-large" />
                <span className="participant-name">Dr. Maya Chen</span>
              </div>
              
              {/* Patient's Picture-in-Picture */}
              <div className={`pip-video ${isVideoOff ? 'video-off' : ''}`}>
                {isVideoOff ? (
                  <div className="avatar-fallback">AH</div>
                ) : (
                  <div className="camera-active-placeholder">You</div>
                )}
              </div>
            </div>

            {/* Video Controls */}
            <div className="video-controls">
              <button 
                className={`control-btn ${isMuted ? 'danger-active' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isMuted ? (
                    <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
                  ) : (
                    <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  )}
                </svg>
              </button>
              
              <button 
                className={`control-btn ${isVideoOff ? 'danger-active' : ''}`}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isVideoOff ? (
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10l-4-3v-.34z"/>
                  ) : (
                    <path d="M23 7l-7 5 7 5V7zM1 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>
                  )}
                </svg>
              </button>

              <button className="control-btn end-call-btn" onClick={handleEndCall}>
                End Call
              </button>
            </div>
          </div>

          {/* Side Panel for Chat or Notes */}
          <div className="chat-section">
            <div className="chat-header">
              <h3>Chat</h3>
            </div>
            <div className="chat-messages">
              <div className="message received">
                <span className="sender">Dr. Maya Chen</span>
                <p>Hello Amelia, I'm reviewing your chart now. How are you feeling today?</p>
                <span className="timestamp">9:31 AM</span>
              </div>
              <div className="message sent">
                <p>Hi Dr. Chen. I'm feeling a bit better, but still have a slight cough.</p>
                <span className="timestamp">9:32 AM</span>
              </div>
            </div>
            <div className="chat-input-area">
              <input type="text" placeholder="Type a message..." className="chat-input" />
              <button className="send-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}