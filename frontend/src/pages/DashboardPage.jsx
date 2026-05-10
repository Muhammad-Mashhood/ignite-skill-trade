import React from 'react';
import { 
  Zap, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Search, 
  Repeat, 
  User, 
  ChevronRight,
  Activity,
  ArrowUpRight,
  Target,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <div className="hero-branding">
          <span className="operational-tag">Dashboard</span>
          <h1 className="hero-title-nodal">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="hero-subtitle-editorial">Here's what's happening with your account.</p>
        </div>
        <div className="hero-visual-nodal">
          <Activity size={40} strokeWidth={1} className="pulse-icon" />
        </div>
      </header>
      
      <section className="telemetry-grid">
        <div className="telemetry-card">
          <div className="card-header-nodal">
            <Zap size={14} className="accent-text" />
            <span className="card-label">Your Credits</span>
          </div>
          <div className="card-body-nodal">
            <h2 className="telemetry-value">{user?.coins || 0}</h2>
            <span className="telemetry-unit">SkillTrade Coins</span>
          </div>
          <div className="card-footer-nodal">
            <div className="trend-indicator up">
              <ArrowUpRight size={10} />
              <span>Active</span>
            </div>
          </div>
        </div>
        
        <div className="telemetry-card">
          <div className="card-header-nodal">
            <BookOpen size={14} className="accent-text" />
            <span className="card-label">Sessions Completed</span>
          </div>
          <div className="card-body-nodal">
            <h2 className="telemetry-value">{user?.totalSessionsCompleted || 0}</h2>
            <span className="telemetry-unit">Total</span>
          </div>
          <div className="card-footer-nodal">
            <span className="telemetry-stat">Keep it up!</span>
          </div>
        </div>
        
        <div className="telemetry-card">
          <div className="card-header-nodal">
            <Star size={14} className="accent-text" />
            <span className="card-label">Your Rating</span>
          </div>
          <div className="card-body-nodal">
            <h2 className="telemetry-value">{user?.rating?.average?.toFixed(1) || '0.0'}</h2>
            <span className="telemetry-unit">out of 5.0</span>
          </div>
          <div className="card-footer-nodal">
            <div className="status-badge-nodal">Verified</div>
          </div>
        </div>
        
        <div className="telemetry-card">
          <div className="card-header-nodal">
            <Target size={14} className="accent-text" />
            <span className="card-label">Your Level</span>
          </div>
          <div className="card-body-nodal">
            <h2 className="telemetry-value">{user?.level || 1}</h2>
            <span className="telemetry-unit">Current Rank</span>
          </div>
          <div className="card-footer-nodal">
            <div className="progress-bar-nodal">
              <div className="progress-fill-nodal" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </section>

      <section className="tactical-actions-section">
        <div className="section-header-nodal">
          <BarChart3 size={16} />
          <h2>Quick Actions</h2>
        </div>
        
        <div className="tactical-grid">
          <a href="/feed" className="tactical-btn">
            <div className="btn-icon-wrapper">
              <Search size={20} />
            </div>
            <div className="btn-content">
              <span className="btn-title">Find a Partner</span>
              <span className="btn-desc">Browse skill exchange posts</span>
            </div>
            <ChevronRight size={14} className="btn-arrow" />
          </a>

          <a href="/courses" className="tactical-btn">
            <div className="btn-icon-wrapper">
              <TrendingUp size={20} />
            </div>
            <div className="btn-content">
              <span className="btn-title">Browse Courses</span>
              <span className="btn-desc">Explore what others are teaching</span>
            </div>
            <ChevronRight size={14} className="btn-arrow" />
          </a>

          <a href="/trades" className="tactical-btn">
            <div className="btn-icon-wrapper">
              <Repeat size={20} />
            </div>
            <div className="btn-content">
              <span className="btn-title">My Trades</span>
              <span className="btn-desc">Check your active exchanges</span>
            </div>
            <ChevronRight size={14} className="btn-arrow" />
          </a>

          <a href="/profile" className="tactical-btn">
            <div className="btn-icon-wrapper">
              <User size={20} />
            </div>
            <div className="btn-content">
              <span className="btn-title">Edit Profile</span>
              <span className="btn-desc">Update your skills and info</span>
            </div>
            <ChevronRight size={14} className="btn-arrow" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
