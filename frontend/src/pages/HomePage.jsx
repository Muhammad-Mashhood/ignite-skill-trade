import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to SkillTrade</h1>
        <p className="hero-subtitle">
          Exchange Skills. Share Knowledge. Build Community.
        </p>
        <p className="hero-description">
          Learn any skill by teaching what you know. No money needed - just your expertise.
        </p>
        {!isAuthenticated && (
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Login
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn btn-primary btn-large">
              Go to Dashboard
            </Link>
          </div>
        )}
      </section>

      <section className="features">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Teach & Earn Coins</h3>
            <p>Share your skills and earn coins for each session you teach.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Learn & Spend Coins</h3>
            <p>Use your coins to learn new skills from others in the community.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Smart Matching</h3>
            <p>AI-powered matching connects you with the perfect learning partners.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global Community</h3>
            <p>Learn from people around the world with AI translation support.</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <h2>Join Our Growing Community</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">500+</div>
            <div className="stat-label">Skills Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Sessions Completed</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
