import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      showSuccess('Account created! Welcome to SkillTrade.');
    } catch (error) {
      showError(error.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-registry-container">
        <div className="auth-status-bar">
          <div className="status-indicator active" />
          <span className="status-text">Create your SkillTrade account</span>
        </div>

        <div className="auth-card-nodal">
          <div className="auth-header-tactical">
            <div className="auth-icon-box">
              <Cpu size={32} strokeWidth={1.5} />
            </div>
            <div className="auth-title-group">
              <h1 className="auth-primary-title">Sign Up</h1>
              <span className="auth-secondary-label">Join the skill sharing network</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-tactical">
            <div className="input-ledger-group">
              <label className="input-tactical-label">Full Name</label>
              <input
                type="text"
                className="input-tactical"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

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

            <div className="input-ledger-group">
              <label className="input-tactical-label">Confirm Password</label>
              <input
                type="password"
                className="input-tactical"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                'Creating account...'
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-tactical">
            <span className="footer-label">Already have an account?</span>
            <Link to="/login" className="footer-link">
              Sign In
            </Link>
          </div>
        </div>

        <div className="auth-telemetry-tray">
          <div className="telemetry-point">
            <span className="point-label">Account Type</span>
            <span className="point-value">ST-X2</span>
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

export default RegisterPage;
