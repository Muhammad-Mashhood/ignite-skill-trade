import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSentProposals, getReceivedProposals, acceptProposal, rejectProposal } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import './ProposalsPage.css';

const ProposalsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('received');
  const [sentProposals, setSentProposals] = useState([]);
  const [receivedProposals, setReceivedProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sent, received] = await Promise.all([
        getSentProposals(),
        getReceivedProposals(),
      ]);
      setSentProposals(sent);
      setReceivedProposals(received);
    } catch (err) {
      setError(err.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (proposalId) => {
    try {
      setProcessingId(proposalId);
      
      // Default values: 50 coins, 60 minutes session
      await acceptProposal(proposalId, {
        message: 'Proposal accepted! Looking forward to our session.',
        coinAmount: 50,
        duration: 60,
      });
      
      showSuccess('Proposal accepted! 🎉 A trade has been created. Check your Trades page.');
      await fetchProposals();
    } catch (err) {
      showError(err.message || 'Failed to accept proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (proposalId) => {
    if (!window.confirm('Are you sure you want to reject this proposal?')) {
      return;
    }

    try {
      setProcessingId(proposalId);
      await rejectProposal(proposalId);
      showSuccess('Proposal rejected');
      await fetchProposals();
    } catch (err) {
      showError(err.message || 'Failed to reject proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: '⏳', label: 'Pending', class: 'status-pending' },
      accepted: { icon: '✅', label: 'Accepted', class: 'status-accepted' },
      rejected: { icon: '❌', label: 'Rejected', class: 'status-rejected' },
      completed: { icon: '🎉', label: 'Completed', class: 'status-completed' },
      withdrawn: { icon: '🚫', label: 'Withdrawn', class: 'status-withdrawn' },
    };
    return badges[status] || badges.pending;
  };

  const getProposalTypeIcon = (type) => {
    return type === 'trade' ? '🤝' : '💬';
  };

  const ProposalCard = ({ proposal, isSent }) => {
    const statusBadge = getStatusBadge(proposal.status);
    const otherUser = isSent ? proposal.receiver : proposal.proposer;

    return (
      <div className="proposal-card">
        <div className="proposal-card-header">
          <div className="proposal-type">
            <span className="type-icon">{getProposalTypeIcon(proposal.proposalType)}</span>
            <span className="type-label">
              {proposal.proposalType === 'trade' ? 'Skill Trade' : 'Chat Request'}
            </span>
          </div>
          <span className={`status-badge ${statusBadge.class}`}>
            {statusBadge.icon} {statusBadge.label}
          </span>
        </div>

        <div className="proposal-content">
          <div className="user-info">
            <div className="user-avatar">
              {otherUser?.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.name} />
              ) : (
                <div className="avatar-placeholder">
                  {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="user-name">
                {isSent ? 'To: ' : 'From: '}
                <strong>{otherUser?.name || 'Unknown User'}</strong>
              </p>
              {otherUser?.rating?.average > 0 && (
                <p className="user-rating">
                  ⭐ {otherUser.rating.average.toFixed(1)}
                </p>
              )}
            </div>
          </div>

          <div className="post-info">
            <p className="post-label">Post:</p>
            <p
              className="post-title"
              onClick={() => navigate(`/posts/${proposal.targetPost._id}`)}
            >
              {proposal.targetPost?.title || 'Post no longer available'}
            </p>
          </div>

          {proposal.proposalType === 'trade' && proposal.offering && (
            <div className="offering-info">
              <p className="offering-label">Offering to teach:</p>
              <div className="offering-skill">
                <span className="skill-name">
                  {proposal.offering.customSkillName || proposal.offering.skill?.name}
                </span>
              </div>
              {proposal.offering.description && (
                <p className="offering-description">{proposal.offering.description}</p>
              )}
            </div>
          )}

          {proposal.message && (
            <div className="proposal-message">
              <p className="message-label">Message:</p>
              <p className="message-text">"{proposal.message}"</p>
            </div>
          )}

          <div className="proposal-meta">
            <span className="proposal-date">
              📅 {new Date(proposal.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {!isSent && proposal.status === 'pending' && (
          <div className="proposal-actions">
            <button
              className="reject-btn"
              onClick={() => handleReject(proposal._id)}
              disabled={processingId === proposal._id}
            >
              ❌ Reject
            </button>
            <button
              className="accept-btn"
              onClick={() => handleAccept(proposal._id)}
              disabled={processingId === proposal._id}
            >
              ✅ Accept
            </button>
          </div>
        )}

        {proposal.status === 'accepted' && (
          <div className="proposal-actions">
            <button
              className="chat-btn"
              onClick={() => navigate(`/chat/${otherUser._id}`)}
            >
              💬 Start Chat
            </button>
            <button
              className="schedule-btn"
              onClick={() => showToast('Scheduling feature coming soon!', 'info')}
            >
              📅 Schedule Session
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="proposals-loading">
        <div className="loading-spinner"></div>
        <p>Loading proposals...</p>
      </div>
    );
  }

  const currentProposals = activeTab === 'sent' ? sentProposals : receivedProposals;

  return (
    <div className="proposals-page">
      <div className="proposals-header">
        <h1>My Proposals</h1>
        <p>Manage your skill trade proposals</p>
      </div>

      {error && (
        <div className="proposals-error">
          <p>⚠️ {error}</p>
          <button onClick={fetchProposals}>Try Again</button>
        </div>
      )}

      <div className="proposals-tabs">
        <button
          className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          📥 Received ({receivedProposals.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          📤 Sent ({sentProposals.length})
        </button>
      </div>

      <div className="proposals-content">
        {currentProposals.length === 0 ? (
          <div className="proposals-empty">
            <div className="empty-icon">📭</div>
            <h3>No {activeTab} proposals</h3>
            <p>
              {activeTab === 'received'
                ? 'When others propose skill trades to you, they will appear here'
                : 'Start browsing posts and propose skill trades!'}
            </p>
            {activeTab === 'sent' && (
              <button
                className="browse-btn"
                onClick={() => navigate('/posts')}
              >
                Browse Posts
              </button>
            )}
          </div>
        ) : (
          <div className="proposals-grid">
            {currentProposals.map((proposal) => (
              <ProposalCard
                key={proposal._id}
                proposal={proposal}
                isSent={activeTab === 'sent'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalsPage;
