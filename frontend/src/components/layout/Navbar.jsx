import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return (
      <nav className="navbar-public">
        <div className="navbar-public-container">
          <Link to="/" className="navbar-logo-public">
            🔄 SkillTrade
          </Link>
          <div className="navbar-public-actions">
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-register">Sign Up</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-container">
        <Link to="/feed" className="sidebar-logo">
          <span className="logo-icon">🔄</span>
          <span className="logo-text">SkillTrade</span>
        </Link>

        <nav className="sidebar-nav">
          <Link to="/feed" className={`nav-item ${isActive('/feed') ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="nav-text">Home</span>
          </Link>

          <Link to="/courses" className={`nav-item ${isActive('/courses') ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="nav-text">Courses</span>
          </Link>

          <Link to="/posts" className={`nav-item ${isActive('/posts') ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="nav-text">Explore</span>
          </Link>

          <Link to="/inbox" className={`nav-item ${isActive('/inbox') ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="nav-text">Messages</span>
          </Link>

          <Link to="/proposals" className={`nav-item ${isActive('/proposals') ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="nav-text">Proposals</span>
          </Link>

          <Link to="/posts/create" className={`nav-item ${isActive('/posts/create') ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="nav-text">Create</span>
          </Link>

          <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <div className="nav-icon avatar-icon">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <span className="nav-text">Profile</span>
          </Link>

          <button 
            className="nav-item nav-more"
            onClick={() => setShowMore(!showMore)}
          >
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="nav-text">More</span>
          </button>

          {showMore && (
            <div className="more-menu">
              <Link to="/courses/my" className="more-item">My Courses</Link>
              <Link to="/posts/my" className="more-item">My Posts</Link>
              <Link to="/trades" className="more-item">My Trades</Link>
              <Link to="/matching" className="more-item">Find Match</Link>
              <div className="more-divider"></div>
              <button onClick={handleLogout} className="more-item logout">Logout</button>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="coins-display">
            <span className="coins-icon">💰</span>
            <span className="coins-amount">{user?.coins || 0}</span>
            <span className="coins-label">Coins</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
