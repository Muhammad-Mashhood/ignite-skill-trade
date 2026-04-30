import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getTrades, completeTrade } from '../services/api';
import { Loader2, CheckCircle, Clock, GraduationCap, BookOpen, Coins, Calendar, Handshake, AlertCircle, CheckSquare, RefreshCw, Star } from 'lucide-react';
import './TradesPage.css';

const TradesPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, active, completed, pending
  const [processingId, setProcessingId] = useState(null);
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrades();
  }, [activeTab]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (activeTab !== 'all') {
        filters.status = activeTab;
      }
      
      const data = await getTrades(filters);
      console.log('Fetched trades:', data);
      
      const tradesArray = Array.isArray(data) ? data : (data.data || []);
      setTrades(tradesArray);
    } catch (err) {
      setError(err.message || 'Failed to load trades');
      console.error('Error fetching trades:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', color: 'status-pending', Icon: Clock },
      accepted: { text: 'Accepted', color: 'status-accepted', Icon: CheckCircle },
      'in-progress': { text: 'In Progress', color: 'status-inprogress', Icon: RefreshCw },
      completed: { text: 'Completed', color: 'status-completed', Icon: CheckCircle },
      cancelled: { text: 'Cancelled', color: 'status-cancelled', Icon: AlertCircle },
      disputed: { text: 'Disputed', color: 'status-disputed', Icon: AlertCircle },
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredTrades = () => {
    if (activeTab === 'all') return trades;
    if (activeTab === 'active') {
      return trades.filter(t => ['pending', 'accepted', 'in-progress'].includes(t.status));
    }
    return trades.filter(t => t.status === activeTab);
  };

  const handleCompleteTrade = async (e, tradeId, isTeacher) => {
    e.stopPropagation(); // Prevent card click
    
    if (!isTeacher) {
      showError('Only the teacher can mark the session as complete');
      return;
    }

    if (!window.confirm('Mark this session as complete? Coins will be transferred.')) {
      return;
    }

    try {
      setProcessingId(tradeId);
      console.log('🔄 Completing trade:', tradeId);
      const result = await completeTrade(tradeId);
      console.log('✅ Trade completed successfully:', result);
      showSuccess('🎉 Session completed! Coins transferred successfully.');
      
      // Refresh trades to show updated status
      await fetchTrades();
      
      // Refresh user data to update coin balance
      await refreshUser();
      console.log('✅ User data refreshed, coins should be updated');
      
      setProcessingId(null);
    } catch (err) {
      console.error('❌ Failed to complete trade:', err);
      showError(err.message || 'Failed to complete trade');
      setProcessingId(null);
    }
  };

  const filteredTrades = getFilteredTrades();

  return (
    <div className="trades-page">
      <div className="trades-header">
        <div className="trades-title-section">
          <h1>My Trades</h1>
          <p>Track your skill exchange sessions</p>
        </div>
        <div className="trades-stats">
          <div className="stat-card">
            <span className="stat-number">{trades.filter(t => t.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{trades.filter(t => ['pending', 'accepted', 'in-progress'].includes(t.status)).length}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </div>

      <div className="trades-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Trades ({trades.length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <RefreshCw size={14} aria-hidden="true" />
            Active ({trades.filter(t => ['pending', 'accepted', 'in-progress'].includes(t.status)).length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <CheckCircle size={14} aria-hidden="true" />
            Completed ({trades.filter(t => t.status === 'completed').length})
          </button>
          <button
            className={`filter-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock size={14} aria-hidden="true" />
            Pending ({trades.filter(t => t.status === 'pending').length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="trades-loading">
          <div className="loading-spinner"></div>
          <p>Loading trades...</p>
        </div>
      )}

      {error && (
        <div className="trades-error">
          <AlertCircle size={20} aria-hidden="true" />
          <p>{error}</p>
          <button onClick={fetchTrades}>Try Again</button>
        </div>
      )}

      {!loading && !error && filteredTrades.length === 0 && (
        <div className="trades-empty">
          <div className="empty-icon"><Handshake size={48} strokeWidth={1.5} aria-hidden="true" /></div>
          <h3>No trades yet</h3>
          <p>Accept a proposal to start your first trade!</p>
          <button
            className="browse-btn"
            onClick={() => navigate('/proposals')}
          >
            View Proposals
          </button>
        </div>
      )}

      {!loading && !error && filteredTrades.length > 0 && (
        <div className="trades-list">
          {filteredTrades.map((trade) => {
            const isTeacher = trade.teacher?._id === user?.uid || trade.teacher === user?.uid;
            const otherUser = isTeacher ? trade.learner : trade.teacher;
            const role = isTeacher ? 'Teaching' : 'Learning';
            const statusBadge = getStatusBadge(trade.status);

            return (
              <div 
                key={trade._id} 
                className="trade-card"
                onClick={() => navigate(`/trades/${trade._id}`)}
              >
                <div className="trade-header">
                  <div className="trade-role">
                    <span className="role-icon">{isTeacher ? <GraduationCap size={16} aria-hidden="true" /> : <BookOpen size={16} aria-hidden="true" />}</span>
                    <span className="role-text">{role}</span>
                  </div>
                  <div className={`status-badge ${statusBadge.color}`}>
                    <statusBadge.Icon size={12} aria-hidden="true" />
                    <span>{statusBadge.text}</span>
                  </div>
                </div>

                <div className="trade-main">
                  <div className="trade-skill">
                    <h3>{trade.skill?.name || 'Skill Trade'}</h3>
                  </div>

                  <div className="trade-partner">
                    <div className="partner-avatar">
                      {otherUser?.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="partner-info">
                      <span className="partner-name">{otherUser?.name || 'User'}</span>
                      {otherUser?.rating?.average > 0 && (
                        <span className="partner-rating">
                          <Star size={12} fill="currentColor" aria-hidden="true" /> {otherUser.rating.average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="trade-details">
                  <div className="trade-detail">
                    <span className="detail-icon"><Coins size={14} aria-hidden="true" /></span>
                    <span className="detail-text">{trade.coinsAmount} coins</span>
                  </div>
                  <div className="trade-detail">
                    <span className="detail-icon"><Clock size={14} aria-hidden="true" /></span>
                    <span className="detail-text">{trade.duration} mins</span>
                  </div>
                  {trade.scheduledAt && (
                    <div className="trade-detail">
                      <span className="detail-icon"><Calendar size={14} aria-hidden="true" /></span>
                      <span className="detail-text">{formatDate(trade.scheduledAt)}</span>
                    </div>
                  )}
                </div>

                {trade.notes && (
                  <div className="trade-notes">
                    <p>{trade.notes}</p>
                  </div>
                )}

                {trade.status === 'completed' && trade.rating?.score && (
                  <div className="trade-rating">
                    <span>Rating: {'⭐'.repeat(trade.rating.score)}</span>
                  </div>
                )}

                {/* Action Buttons */}
                {trade.status === 'accepted' && isTeacher && (
                  <div className="trade-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-complete"
                      onClick={(e) => handleCompleteTrade(e, trade._id, isTeacher)}
                      disabled={processingId === trade._id}
                    >
                      {processingId === trade._id
                        ? <><Loader2 size={14} className="spin-icon" aria-hidden="true" /> Processing...</>
                        : <><CheckSquare size={14} aria-hidden="true" /> Mark as Complete</>}
                    </button>
                    <p className="action-hint">
                      <Coins size={12} aria-hidden="true" /> {trade.coinsAmount} coins will be transferred to you
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TradesPage;
