import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showSuccess('Welcome back! Redirecting...');
    } catch (error) {
      showError(error.message || 'Sign in failed. Please check your email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-registry-container">
        <div className="auth-status-bar">
          <div className="status-indicator active" />
          <span className="status-text">Welcome back to SkillTrade</span>
        </div>

        <div className="auth-card-nodal">
          <div className="auth-header-tactical">
            <div className="auth-icon-box">
              <Shield size={32} strokeWidth={1.5} />
            </div>
            <div className="auth-title-group">
              <h1 className="auth-primary-title">Sign In</h1>
              <span className="auth-secondary-label">Access your SkillTrade account</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-tactical">
            <div className="input-ledger-group">
              <label className="input-tactical-label">Email Address</label>
              <input
                type="email"
                className="input-tactical"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="input-ledger-group">
              <label className="input-tactical-label">Password</label>
              <input
                type="password"
                className="input-tactical"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-auth-tactical" 
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-tactical">
            <span className="footer-label">Don't have an account?</span>
            <Link to="/register" className="footer-link">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="auth-telemetry-tray">
          <div className="telemetry-point">
            <span className="point-label">ENCRYPTION</span>
            <span className="point-value">AES-256</span>
          </div>
          <div className="telemetry-point">
            <span className="point-label">STATUS</span>
            <span className="point-value">ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
