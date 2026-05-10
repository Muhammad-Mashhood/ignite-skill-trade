import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Book, 
  Compass, 
  MessageSquare, 
  FileText, 
  Plus, 
  User, 
  MoreHorizontal, 
  Zap, 
  Terminal,
  LogOut,
  Layers,
  Sparkles,
  Search,
  Database,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
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
            <Terminal size={24} className="accent-icon" />
            <span className="logo-text">SkillTrade</span>
          </Link>
          <div className="navbar-public-actions">
            <button className="btn-theme-toggle-public" onClick={toggleTheme} title="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="btn-login-tactical">Sign In</Link>
            <Link to="/register" className="btn-join-tactical">Sign Up</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <aside className="sidebar-tactical">
      <div className="sidebar-header-nodal">
        <Link to="/feed" className="sidebar-logo-nodal">
          <div className="logo-icon-box">
            <Terminal size={24} strokeWidth={2.5} />
          </div>
          <span className="logo-text-nodal">SkillTrade</span>
        </Link>
        <div className="sidebar-sub-label">Knowledge Exchange</div>
      </div>

      <nav className="sidebar-nav-nodal">
        <Link to="/feed" className={`nav-link-nodal ${isActive('/feed') ? 'active' : ''}`}>
          <Activity size={20} />
          <span className="nav-label">Feed</span>
        </Link>

        <Link to="/courses" className={`nav-link-nodal ${isActive('/courses') ? 'active' : ''}`}>
          <Book size={20} />
          <span className="nav-label">Courses</span>
        </Link>

        <Link to="/posts" className={`nav-link-nodal ${isActive('/posts') ? 'active' : ''}`}>
          <Compass size={20} />
          <span className="nav-label">Browse Posts</span>
        </Link>

        <Link to="/inbox" className={`nav-link-nodal ${isActive('/inbox') ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span className="nav-label">Messages</span>
        </Link>

        <Link to="/proposals" className={`nav-link-nodal ${isActive('/proposals') ? 'active' : ''}`}>
          <FileText size={20} />
          <span className="nav-label">Proposals</span>
        </Link>

        <Link to="/posts/create" className={`nav-link-nodal ${isActive('/posts/create') ? 'active' : ''}`}>
          <Plus size={20} />
          <span className="nav-label">New Post</span>
        </Link>

        <Link to="/profile" className={`nav-link-nodal ${isActive('/profile') ? 'active' : ''}`}>
          <div className="nav-avatar-tactical">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} className="avatar-img-tactical" />
            ) : (
              <User size={20} />
            )}
          </div>
          <span className="nav-label">My Profile</span>
        </Link>

        <div className="sidebar-divider-nodal" />

        <button 
          className={`nav-link-nodal btn-more-nodal ${showMore ? 'active' : ''}`}
          onClick={() => setShowMore(!showMore)}
        >
          <MoreHorizontal size={20} />
          <span className="nav-label">More</span>
        </button>

        {showMore && (
          <div className="expansion-tray-nodal">
            <Link to="/courses/my" className="tray-item-nodal">
              <Database size={16} /> My Courses
            </Link>
            <Link to="/posts/my" className="tray-item-nodal">
              <Layers size={16} /> My Posts
            </Link>
            <Link to="/trades" className="tray-item-nodal">
              <Sparkles size={16} /> My Trades
            </Link>
            <Link to="/matching" className="tray-item-nodal">
              <Search size={16} /> Find Matches
            </Link>
            <div className="tray-divider-nodal"></div>
            <button onClick={handleLogout} className="tray-item-nodal logout-tactical">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </nav>

      <div className="sidebar-footer-nodal">
        <div className="telemetry-card-sidebar">
          <div className="telemetry-header-sidebar">
            <Zap size={12} className="accent-icon" />
            <span className="telemetry-label">Credits</span>
          </div>
          <div className="telemetry-value-sidebar">
            <span className="token-amount">{user?.coins || 0}</span>
            <span className="token-unit">SKT</span>
          </div>
        </div>
        <button className="btn-theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
