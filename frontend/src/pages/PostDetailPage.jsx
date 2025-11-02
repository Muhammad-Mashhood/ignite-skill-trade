import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPostById, createProposal } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ProposalModal from '../components/proposals/ProposalModal';
import './PostDetailPage.css';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const data = await getPostById(id);
      setPost(data);
    } catch (err) {
      setError(err.message || 'Failed to load post details');
    } finally {
      setLoading(false);
    }
  };

  const handleProposeSkillTrade = () => {
    if (!user) {
      showError('Please login to send proposals');
      navigate('/login');
      return;
    }
    setIsProposalModalOpen(true);
  };

  const handleSubmitProposal = async (proposalData) => {
    try {
      await createProposal(proposalData);
      showSuccess('Proposal sent successfully! 🎉');
      setIsProposalModalOpen(false);
    } catch (err) {
      throw new Error(err.message || 'Failed to send proposal');
    }
  };

  const handleSendMessage = () => {
    // TODO: Navigate to chat
    if (!user) {
      showError('Please login to send messages');
      navigate('/login');
      return;
    }
    navigate(`/chat/${post.user._id}`);
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading post details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-error">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-error">
        <h2>Post not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const isOwner = user && post.user._id === user.uid;

  return (
    <div className="post-detail-page">
      {/* Header Section */}
      <div className="post-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        
        <div className="header-content">
          <div className="header-main">
            <div className="post-type-badge">
              🔄 Skill Trade
            </div>
            <h1>{post.title}</h1>
            
            <div className="post-meta">
              <div className="creator-info">
                <div className="creator-avatar">
                  {post.user?.avatar ? (
                    <img src={post.user.avatar} alt={post.user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {post.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="creator-name">{post.user?.name || 'Anonymous'}</p>
                  <p className="creator-rating">
                    ⭐ {post.user?.rating?.average?.toFixed(1) || 'New'} 
                    {post.user?.rating?.count > 0 && ` (${post.user.rating.count})`}
                  </p>
                </div>
              </div>
              
              <div className="post-stats">
                <span>👁️ {post.stats?.views || 0} views</span>
                <span>❤️ {post.stats?.interests || 0} interested</span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwner && (
              <div className="action-buttons">
                <button className="propose-btn" onClick={handleProposeSkillTrade}>
                  🤝 Propose Skill Trade
                </button>
                <button className="message-btn" onClick={handleSendMessage}>
                  💬 Send Message
                </button>
              </div>
            )}

            {isOwner && (
              <button className="edit-btn" onClick={() => navigate(`/posts/edit/${id}`)}>
                ✏️ Edit Post
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="post-detail-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          Skills Details
        </button>
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About Creator
        </button>
      </div>

      {/* Content Area */}
      <div className="post-detail-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Skills Summary */}
            {((post.willTeach && post.willTeach.length > 0) || (post.wantToLearn && post.wantToLearn.length > 0)) && (
              <section className="content-section skills-summary">
                <h2>🎯 Skills Overview</h2>
                <div className="skills-overview-grid">
                  {post.willTeach && post.willTeach.length > 0 && (
                    <div className="skills-overview-column">
                      <h3 className="teach-header">🎓 Will Teach</h3>
                      <div className="skills-badges">
                        {post.willTeach.map((skill, index) => (
                          <span key={index} className="skill-badge teach-badge">
                            {skill.customSkillName || skill.skill?.name}
                            {skill.level && <span className="skill-level"> • {skill.level}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {post.wantToLearn && post.wantToLearn.length > 0 && (
                    <div className="skills-overview-column">
                      <h3 className="learn-header">📚 Want to Learn</h3>
                      <div className="skills-badges">
                        {post.wantToLearn.map((skill, index) => (
                          <span key={index} className="skill-badge learn-badge">
                            {skill.customSkillName || skill.skill?.name}
                            {skill.level && <span className="skill-level"> • {skill.level}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="content-section">
              <h2>Description</h2>
              <p className="description-text">{post.description}</p>
            </section>

            {post.requirements && post.requirements.length > 0 && (
              <section className="content-section">
                <h2>📋 Requirements</h2>
                <ul className="requirements-list">
                  {post.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </section>
            )}

            {post.outcomes && post.outcomes.length > 0 && (
              <section className="content-section">
                <h2>🎯 Learning Outcomes</h2>
                <ul className="outcomes-list">
                  {post.outcomes.map((outcome, index) => (
                    <li key={index}>{outcome}</li>
                  ))}
                </ul>
              </section>
            )}

            {post.tags && post.tags.length > 0 && (
              <section className="content-section">
                <h2>🏷️ Tags</h2>
                <div className="tags-container">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="tag-badge">{tag}</span>
                  ))}
                </div>
              </section>
            )}

            {(post.duration || post.maxParticipants) && (
              <section className="content-section">
                <h2>📊 Details</h2>
                <div className="details-grid">
                  {post.duration && (
                    <div className="detail-item">
                      <span className="detail-icon">⏱️</span>
                      <div>
                        <p className="detail-label">Session Duration</p>
                        <p className="detail-value">{post.duration} minutes</p>
                      </div>
                    </div>
                  )}
                  {post.maxParticipants && (
                    <div className="detail-item">
                      <span className="detail-icon">👥</span>
                      <div>
                        <p className="detail-label">Max Participants</p>
                        <p className="detail-value">{post.maxParticipants} people</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="skills-tab">
            {/* Will Teach Section */}
            {post.willTeach && post.willTeach.length > 0 && (
              <section className="content-section teach-section">
                <h2>🎓 Skills They Will Teach</h2>
                <div className="skills-grid">
                  {post.willTeach.map((skill, index) => (
                    <div key={index} className="skill-card teach-card">
                      <div className="skill-card-header">
                        <h3>{skill.customSkillName || skill.skill?.name}</h3>
                        <span className="skill-level-badge">{skill.level}</span>
                      </div>
                      {skill.description && (
                        <p className="skill-description">{skill.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Want to Learn Section */}
            {post.wantToLearn && post.wantToLearn.length > 0 && (
              <section className="content-section learn-section">
                <h2>📚 Skills They Want to Learn</h2>
                <div className="skills-grid">
                  {post.wantToLearn.map((skill, index) => (
                    <div key={index} className="skill-card learn-card">
                      <div className="skill-card-header">
                        <h3>{skill.customSkillName || skill.skill?.name}</h3>
                        <span className="skill-level-badge">{skill.level}</span>
                      </div>
                      {skill.description && (
                        <p className="skill-description">{skill.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Trade Match Suggestion */}
            {!isOwner && (
              <section className="content-section trade-suggestion">
                <div className="suggestion-box">
                  <h3>💡 Perfect Match?</h3>
                  <p>If you can teach what they want to learn, or want to learn what they teach, propose a skill trade!</p>
                  <button className="propose-btn-large" onClick={handleProposeSkillTrade}>
                    🤝 Propose Skill Trade
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* About Creator Tab */}
        {activeTab === 'about' && (
          <div className="about-tab">
            <section className="content-section">
              <div className="creator-profile">
                <div className="creator-avatar-large">
                  {post.user?.avatar ? (
                    <img src={post.user.avatar} alt={post.user.name} />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {post.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <h2>{post.user?.name || 'Anonymous'}</h2>
                <div className="creator-stats">
                  <div className="stat">
                    <span className="stat-label">Rating</span>
                    <span className="stat-value">
                      ⭐ {post.user?.rating?.average?.toFixed(1) || 'New'}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Reviews</span>
                    <span className="stat-value">{post.user?.rating?.count || 0}</span>
                  </div>
                </div>
                {post.user?.bio && (
                  <p className="creator-bio">{post.user.bio}</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        post={post}
        onSubmit={handleSubmitProposal}
      />
    </div>
  );
};

export default PostDetailPage;
