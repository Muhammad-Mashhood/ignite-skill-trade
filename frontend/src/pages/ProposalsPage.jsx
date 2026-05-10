import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Zap, 
  User, 
  Calendar, 
  MessageSquare,
  Repeat,
  Inbox,
  Send,
  Plus,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Ban
} from 'lucide-react';
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
      
      await acceptProposal(proposalId, {
        message: 'Proposal accepted.',
        coinAmount: 50,
        duration: 60,
      });
      
      showSuccess('Proposal accepted! A trade has been created.');
      await fetchProposals();
    } catch (err) {
      showError(err.message || 'Failed to accept proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (proposalId) => {
    if (!window.confirm('Are you sure you want to decline this proposal?')) {
      return;
    }

    try {
      setProcessingId(proposalId);
      await rejectProposal(proposalId);
      showSuccess('Proposal declined.');
      await fetchProposals();
    } catch (err) {
      showError(err.message || 'Failed to reject proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: Clock, label: 'PENDING', color: 'var(--text-tertiary)' },
      accepted: { icon: ShieldCheck, label: 'ACCEPTED', color: 'var(--accent)' },
      rejected: { icon: XCircle, label: 'REJECTED', color: '#FF4444' },
      completed: { icon: CheckCircle, label: 'COMPLETED', color: '#00FF94' },
      withdrawn: { icon: Ban, label: 'WITHDRAWN', color: 'var(--text-tertiary)' },
    };
    return configs[status] || configs.pending;
  };

  const ProposalCard = ({ proposal, isSent }) => {
    const statusConfig = getStatusConfig(proposal.status);
    const StatusIcon = statusConfig.icon;
    const otherUser = isSent ? proposal.receiver : proposal.proposer;

    return (
      <article className={`proposal-ledger-card ${proposal.status}`}>
        <div className="card-status-accent" style={{ backgroundColor: statusConfig.color }}></div>
        
        <div className="card-header">
          <div className="proposal-category">
            {proposal.proposalType === 'trade' ? (
              <><Repeat size={10} /> <span>Skill Swap</span></>
            ) : (
              <><MessageSquare size={10} /> <span>Chat Request</span></>
            )}
          </div>
          <div className="status-badge" style={{ color: statusConfig.color }}>
            <StatusIcon size={12} />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        <div className="card-body">
          <div className="participant-node">
            <div className="avatar-nodal">
              {otherUser?.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.name} />
              ) : (
                <User size={16} />
              )}
            </div>
            <div className="participant-meta">
              <span className="direction">{isSent ? 'To' : 'From'}</span>
              <span className="name">{otherUser?.name || 'Unknown User'}</span>
            </div>
          </div>

          <div className="target-node" onClick={() => navigate(`/posts/${proposal.targetPost._id}`)}>
            <div className="target-label">Post</div>
            <div className="target-title">
              {proposal.targetPost?.title || 'Post no longer available'}
              <ExternalLink size={12} />
            </div>
          </div>

          {proposal.proposalType === 'trade' && proposal.offering && (
            <div className="offering-module">
              <div className="offering-label">Skill Offered</div>
              <div className="offering-skill">
                <Zap size={10} className="accent-icon" />
                <span>{proposal.offering.customSkillName || proposal.offering.skill?.name}</span>
              </div>
              {proposal.offering.description && (
                <p className="offering-note">{proposal.offering.description}</p>
              )}
            </div>
          )}

          {proposal.message && (
            <div className="message-module">
              <div className="message-label">Message</div>
              <p className="message-text">"{proposal.message}"</p>
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="meta-timestamp">
            <Calendar size={12} />
            <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="card-interactions">
            {!isSent && proposal.status === 'pending' && (
              <div className="action-cluster">
                <button
                  className="btn-reject-editorial"
                  onClick={() => handleReject(proposal._id)}
                  disabled={processingId === proposal._id}
                  title="Decline"
                >
                  <XCircle size={16} />
                </button>
                <button
                  className="btn-accept-editorial"
                  onClick={() => handleAccept(proposal._id)}
                  disabled={processingId === proposal._id}
                  title="Accept"
                >
                  <CheckCircle size={16} />
                </button>
              </div>
            )}

            {proposal.status === 'accepted' && (
              <div className="action-cluster-full">
                <button
                  className="btn-chat-editorial"
                  onClick={() => navigate(`/chat/${otherUser._id}`)}
                >
                  <MessageSquare size={14} />
                  <span>Message</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  if (loading && sentProposals.length === 0) {
    return (
      <div className="proposals-loading-container">
        <div className="editorial-loader">
          <div className="loader-bar"></div>
          <span className="loader-text">Loading proposals...</span>
        </div>
      </div>
    );
  }

  const currentProposals = activeTab === 'sent' ? sentProposals : receivedProposals;

  return (
    <div className="proposals-page">
      <header className="proposals-hero">
        <div className="hero-content">
          <h1 className="editorial-title">Proposals Registry</h1>
          <p className="editorial-subtitle">Review and respond to skill exchange requests.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-module">
            <span className="label">RECEIVED</span>
            <span className="value">{receivedProposals.length}</span>
          </div>
          <div className="stat-module">
            <span className="label">SENT</span>
            <span className="value">{sentProposals.length}</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="editorial-error-card">
          <ShieldAlert size={24} />
          <div className="error-content">
            <h3>Failed to Load Proposals</h3>
            <p>{error}</p>
          </div>
          <button onClick={fetchProposals} className="btn-retry">RETRY</button>
        </div>
      )}

      <nav className="proposals-nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <ArrowDownLeft size={14} />
          <span>Received</span>
          <span className="count">{receivedProposals.length}</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <ArrowUpRight size={14} />
          <span>Sent</span>
          <span className="count">{sentProposals.length}</span>
        </button>
      </nav>

      <div className="proposals-main-content">
        {currentProposals.length === 0 ? (
          <div className="proposals-empty-state">
            <div className="empty-visual">
              {activeTab === 'received' ? <Inbox size={64} strokeWidth={1} /> : <Send size={64} strokeWidth={1} />}
            </div>
            <h3>No proposals yet</h3>
            <p>
              {activeTab === 'received'
                ? 'No one has sent you a proposal yet.'
                : 'You haven\'t sent any proposals yet.'}
            </p>
            {activeTab === 'sent' && (
              <button
                className="editorial-btn-primary"
                onClick={() => navigate('/posts')}
              >
                <span>Browse Posts</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="proposals-ledger-grid">
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
