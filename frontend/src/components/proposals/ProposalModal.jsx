import React, { useState } from 'react';
import './ProposalModal.css';

const ProposalModal = ({ isOpen, onClose, post, onSubmit }) => {
  const [proposalData, setProposalData] = useState({
    proposalType: 'trade',
    offeringSkill: '',
    customSkillName: '',
    description: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProposalData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate based on proposal type
      if (proposalData.proposalType === 'trade' && !proposalData.customSkillName.trim()) {
        setError('Please enter the skill you want to offer');
        setLoading(false);
        return;
      }

      const payload = {
        targetPostId: post._id,
        proposalType: proposalData.proposalType,
        message: proposalData.message || 'Hi! I\'m interested in your post.',
      };

      // Add offering details for trade proposals
      if (proposalData.proposalType === 'trade') {
        payload.offering = {
          customSkillName: proposalData.customSkillName,
          description: proposalData.description,
        };
      }

      await onSubmit(payload);
      
      // Reset form and close
      setProposalData({
        proposalType: 'trade',
        offeringSkill: '',
        customSkillName: '',
        description: '',
        message: '',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Propose Skill Trade</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div className="modal-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="proposal-form">
          {/* Proposal Type */}
          <div className="form-group">
            <label>How would you like to connect?</label>
            <div className="proposal-type-options">
              <label className={`type-option ${proposalData.proposalType === 'trade' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="proposalType"
                  value="trade"
                  checked={proposalData.proposalType === 'trade'}
                  onChange={handleChange}
                />
                <div className="type-option-content">
                  <span className="type-icon">🤝</span>
                  <div>
                    <strong>Skill Trade</strong>
                    <p>Exchange skills - you teach me, I teach you</p>
                  </div>
                </div>
              </label>

              <label className={`type-option ${proposalData.proposalType === 'chat' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="proposalType"
                  value="chat"
                  checked={proposalData.proposalType === 'chat'}
                  onChange={handleChange}
                />
                <div className="type-option-content">
                  <span className="type-icon">💬</span>
                  <div>
                    <strong>Just Chat</strong>
                    <p>Discuss details and figure out an arrangement</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Trade Details - Only show for trade type */}
          {proposalData.proposalType === 'trade' && (
            <div className="trade-details-section">
              <h3>What Can You Offer?</h3>
              <p className="section-hint">Tell them what skill you can teach in exchange</p>

              <div className="form-group">
                <label htmlFor="customSkillName">Skill Name *</label>
                <input
                  type="text"
                  id="customSkillName"
                  name="customSkillName"
                  value={proposalData.customSkillName}
                  onChange={handleChange}
                  placeholder="e.g., Web Development, Guitar, Cooking"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Skill Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={proposalData.description}
                  onChange={handleChange}
                  placeholder="Describe your skill and what you can teach..."
                  rows={3}
                  className="form-textarea"
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div className="form-group">
            <label htmlFor="message">Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              value={proposalData.message}
              onChange={handleChange}
              placeholder="Add a personal message to introduce yourself..."
              rows={4}
              className="form-textarea"
            />
          </div>

          {/* Summary Box */}
          <div className="proposal-summary">
            <h4>📋 Proposal Summary</h4>
            <div className="summary-item">
              <span className="summary-label">To:</span>
              <span className="summary-value">{post.user?.name || 'User'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Post:</span>
              <span className="summary-value">{post.title}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Type:</span>
              <span className="summary-value">
                {proposalData.proposalType === 'trade' ? '🤝 Skill Trade' : '💬 Chat Request'}
              </span>
            </div>
            {proposalData.proposalType === 'trade' && proposalData.customSkillName && (
              <div className="summary-item">
                <span className="summary-label">Your Offer:</span>
                <span className="summary-value">{proposalData.customSkillName}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : '✉️ Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;
