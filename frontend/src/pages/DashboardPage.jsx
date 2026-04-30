import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <h1>Welcome back, {user?.name}!</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>💰 Your Coins</h3>
          <p className="dashboard-number">{user?.coins || 0}</p>
          <p className="dashboard-label">Available Balance</p>
        </div>
        
        <div className="dashboard-card">
          <h3>📚 Sessions Completed</h3>
          <p className="dashboard-number">{user?.totalSessionsCompleted || 0}</p>
          <p className="dashboard-label">Total Sessions</p>
        </div>
        
        <div className="dashboard-card">
          <h3>⭐ Your Rating</h3>
          <p className="dashboard-number">{user?.rating?.average?.toFixed(1) || '0.0'}</p>
          <p className="dashboard-label">Average Rating</p>
        </div>
        
        <div className="dashboard-card">
          <h3>🎯 Level</h3>
          <p className="dashboard-number">{user?.level || 1}</p>
          <p className="dashboard-label">Current Level</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/matching" className="action-button">
            <span className="action-icon">🔍</span>
            <span>Find Learning Partner</span>
          </a>
          <a href="/skills" className="action-button">
            <span className="action-icon">📖</span>
            <span>Browse Skills</span>
          </a>
          <a href="/trades" className="action-button">
            <span className="action-icon">📋</span>
            <span>My Trades</span>
          </a>
          <a href="/profile" className="action-button">
            <span className="action-icon">👤</span>
            <span>Edit Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
