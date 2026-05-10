import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Repeat, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Zap, 
  X, 
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  FileText,
  History,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getMyTrades, updateTradeStatus } from '../services/api';
import './TradesPage.css';

const TradesPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const data = await getMyTrades();
      setTrades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching trades:', error);
      showError('Failed to load your trades.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tradeId, newStatus) => {
    try {
      await updateTradeStatus(tradeId, newStatus);
      showSuccess(`Trade updated to ${newStatus}.`);
      fetchTrades();
    } catch (error) {
      showError('Failed to update trade status.');
    }
  };

  const filteredTrades = trades.filter(trade => {
    if (activeTab === 'all') return true;
    return trade.status === activeTab;
  });

  if (loading) {
    return (
      <div className="trades-loading-container">
        <div className="editorial-loader">
          <div className="loader-bar"></div>
          <span className="loader-text">Loading your trades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="trades-page">
      <header className="trades-hero">
        <div className="hero-branding">
          <span className="protocol-tag">Skill Trades</span>
          <h1 className="hero-title-nodal">My Trades</h1>
          <p className="hero-subtitle-editorial">Track all your active and past skill exchanges.</p>
        </div>
        <div className="trades-metrics">
          <div className="metric-nodal">
            <span className="metric-value">{trades.filter(t => t.status === 'active').length}</span>
            <span className="metric-label">Active</span>
          </div>
          <div className="metric-nodal">
            <span className="metric-value">{trades.filter(t => t.status === 'completed').length}</span>
            <span className="metric-label">Completed</span>
          </div>
        </div>
      </header>

      <nav className="trades-tabs-nodal">
        <button 
          className={`trade-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <div className="tab-indicator"></div>
          <span>All</span>
        </button>
        <button 
          className={`trade-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <div className="tab-indicator"></div>
          <span>Pending</span>
        </button>
        <button 
          className={`trade-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <div className="tab-indicator"></div>
          <span>In Progress</span>
        </button>
        <button 
          className={`trade-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <div className="tab-indicator"></div>
          <span>Completed</span>
        </button>
      </nav>

      <main className="trades-ledger">
        {filteredTrades.length > 0 ? (
          <div className="ledger-stack">
            {filteredTrades.map(trade => (
              <article key={trade._id} className={`ledger-item ${trade.status}`}>
                <div className="item-nodal-header">
                  <div className="trade-originator">
                    <img 
                      src={trade.teacher?._id === user._id ? trade.learner?.avatar : trade.teacher?.avatar} 
                      alt="Avatar"
                      className="nodal-avatar-sm"
                    />
                    <div className="originator-info">
                      <span className="originator-label">Partner</span>
                      <span className="originator-name">
                        {trade.teacher?._id === user._id ? trade.learner?.name : trade.teacher?.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="trade-status-indicator">
                    {trade.status === 'completed' ? <CheckCircle size={14} className="accent-text" /> : <Clock size={14} />}
                    <span className="status-text">{trade.status.toUpperCase()}</span>
                  </div>
                </div>

                <div className="item-nodal-body">
                  <div className="trade-skill-vector">
                    <div className="vector-label">Skill</div>
                    <h3 className="vector-title">{trade.skill?.name || 'Unknown Skill'}</h3>
                  </div>

                  <div className="trade-role-indicator">
                    <span className="role-label">Your Role</span>
                    <span className="role-value">
                      {trade.teacher?._id === user._id ? 'Teacher' : 'Student'}
                    </span>
                  </div>

                  <div className="trade-value-nodal">
                    <Zap size={14} fill="var(--accent)" stroke="var(--accent)" />
                    <span className="value-amount">{trade.coinsAmount}</span>
                    <span className="value-unit">coins</span>
                  </div>
                </div>

                <div className="item-nodal-footer">
                  <div className="trade-meta-row">
                    <History size={12} />
                    <span>Started {new Date(trade.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="trade-actions-nodal">
                    {trade.status === 'pending' && trade.teacher?._id === user._id && (
                      <>
                        <button 
                          className="btn-nodal-success"
                          onClick={() => handleStatusUpdate(trade._id, 'active')}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn-nodal-danger"
                          onClick={() => handleStatusUpdate(trade._id, 'cancelled')}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {trade.status === 'active' && (
                      <button 
                        className="btn-nodal-primary"
                        onClick={() => handleStatusUpdate(trade._id, 'completed')}
                      >
                        Mark Complete
                      </button>
                    )}
                    <button className="btn-nodal-ghost">
                      <MessageSquare size={14} />
                      <span>Message</span>
                    </button>
                    <button className="btn-nodal-ghost">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-ledger-state">
            <Activity size={64} strokeWidth={0.5} />
            <h2>No trades yet</h2>
            <p>You don't have any trades matching this filter.</p>
            <button className="btn-primary-nodal" onClick={() => navigate('/feed')}>
              Find a Partner
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TradesPage;
