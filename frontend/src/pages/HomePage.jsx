import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Zap, 
  Globe, 
  ShieldCheck, 
  BarChart,
  Command
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-editorial">
        <div className="hero-container">
          <div className="hero-signal-tag">
            <Zap size={14} /> <span>The future of skill sharing</span>
          </div>
          <h1 className="hero-title">SKILLTRADE<br /><span className="title-outline">Learn. Teach. Grow.</span></h1>
          <p className="hero-description">
            A peer-to-peer platform where you exchange skills instead of money. 
            Teach what you know. Learn what you need. No barriers.
          </p>
          
          <div className="hero-actions-nodal">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary-nodal">
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn-secondary-nodal">
                  Sign In
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="btn-primary-nodal">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header-nodal">
          <span className="section-number">01</span>
          <h2 className="section-title">How It Works</h2>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><Command size={32} /></div>
            <h3 className="feature-title">Share Your Skills</h3>
            <p className="feature-desc">Offer your expertise — whether it's design, coding, music, or anything else — and earn credits.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><BookOpen size={32} /></div>
            <h3 className="feature-title">Learn from Others</h3>
            <p className="feature-desc">Use your credits to unlock courses and book 1-on-1 sessions with skilled mentors.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><Zap size={32} /></div>
            <h3 className="feature-title">Smart Matching</h3>
            <p className="feature-desc">Our AI finds the best skill-swap partners for you based on what you offer and what you need.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon"><Globe size={32} /></div>
            <h3 className="feature-title">Global Network</h3>
            <p className="feature-desc">Connect with passionate learners and teachers from around the world.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="metrics-nodal">
        <div className="section-header-nodal">
          <span className="section-number">02</span>
          <h2 className="section-title">By the Numbers</h2>
        </div>
        
        <div className="metrics-ledger">
          <div className="metric-row">
            <div className="metric-identity">
              <Users size={18} />
              <span className="metric-label">Active Members</span>
            </div>
            <span className="metric-value">12.4K</span>
          </div>
          
          <div className="metric-row">
            <div className="metric-identity">
              <Zap size={18} />
              <span className="metric-label">Skills Available</span>
            </div>
            <span className="metric-value">850+</span>
          </div>
          
          <div className="metric-row">
            <div className="metric-identity">
              <ShieldCheck size={18} />
              <span className="metric-label">Successful Exchanges</span>
            </div>
            <span className="metric-value">62.1K</span>
          </div>
          
          <div className="metric-row">
            <div className="metric-identity">
              <BarChart size={18} />
              <span className="metric-label">Satisfaction Rate</span>
            </div>
            <span className="metric-value">94%</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="terminal-cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-desc">Join thousands of people already exchanging skills on SkillTrade.</p>
          <Link to="/register" className="btn-primary-nodal cta-btn">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
