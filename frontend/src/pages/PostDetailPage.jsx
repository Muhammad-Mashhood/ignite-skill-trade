import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  User, 
  Star, 
  Eye, 
  Heart, 
  MessageSquare, 
  Handshake, 
  Edit3, 
  Clock, 
  Users, 
  Target, 
  BookOpen, 
  GraduationCap,
  ArrowRight,
  Info,
  Tag
} from 'lucide-react';
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
      showSuccess('Proposal sent successfully!');
      setIsProposalModalOpen(false);
    } catch (err) {
      throw new Error(err.message || 'Failed to send proposal');
    }
  };

  const handleSendMessage = () => {
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
        <div className="nodal-loader"></div>
        <p className="nodal-loader-text">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-error">
        <h2 className="editorial-title">{error ? 'Something went wrong' : 'Post not found'}</h2>
        <p className="ledger-desc">{error || 'The requested resource could not be located in the registry.'}</p>
        <button className="btn-back-nodal" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back to Posts
        </button>
      </div>
    );
  }

  const isOwner = user && post.user._id === user.uid;

  return (
    <div className="post-detail-page">
      {/* Header Section */}
      <div className="post-detail-hero">
        <div className="hero-nodal-nav">
          <button className="btn-back-nodal" onClick={() => navigate(-1)}>
            <ChevronLeft size={14} /> Back
          </button>
        </div>
        
        <div className="hero-content">
          <div className="hero-labels">
            <span className="editorial-label">Skill Exchange</span>
            <span className="separator">•</span>
            <span className="editorial-label">ID_{id.substring(0, 8).toUpperCase()}</span>
          </div>
          <h1 className="editorial-title">{post.title}</h1>
          
          <div className="post-nodal-meta">
            <div className="creator-nodal">
              <img
                src={post.user?.avatar || '/default-avatar.png'}
                alt={post.user?.name}
                className="nodal-avatar-small"
              />
              <div className="instructor-text">
                <span className="label-minimal">ORIGINATOR</span>
                <span className="creator-name-text">{post.user?.name || 'ANONYMOUS'}</span>
              </div>
            </div>
            
            <div className="rating-nodal">
              <Star size={16} fill="var(--accent)" color="var(--accent)" />
              <span className="rating-value">{post.user?.rating?.average?.toFixed(1) || 'NEW'}</span>
              <span className="rating-count">({post.user?.rating?.count || 0} REVIEWS)</span>
            </div>

            <div className="post-stats-nodal">
              <div className="stat-pill">
                <Eye size={12} /> <span>{post.stats?.views || 0}</span>
              </div>
              <div className="stat-pill">
                <Heart size={12} /> <span>{post.stats?.interests || 0}</span>
              </div>
            </div>
          </div>

          <div className="hero-actions">
            {!isOwner ? (
              <div className="action-cluster">
                <button className="btn-propose-nodal" onClick={handleProposeSkillTrade}>
                  <Handshake size={18} /> Send a Proposal
                </button>
                <button className="btn-message-nodal" onClick={handleSendMessage}>
                  <MessageSquare size={18} /> Message
                </button>
              </div>
            ) : (
              <button className="btn-edit-nodal" onClick={() => navigate(`/posts/edit/${id}`)}>
                <Edit3 size={18} /> Edit Post
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="post-detail-tabs-nodal">
        <button 
          className={`tab-nodal ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          01 OVERVIEW
        </button>
        <button 
          className={`tab-nodal ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          02 Skills
        </button>
        <button 
          className={`tab-nodal ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          03 About
        </button>
      </div>

      {/* Content Area */}
      <div className="post-detail-content-ledger">
        {activeTab === 'overview' && (
          <div className="overview-ledger">
            {/* Skills Matrix */}
            <section className="ledger-section">
              <div className="section-header">
                <span className="section-number">01.1</span>
                <h2 className="section-title">Skills</h2>
              </div>
              <div className="skills-matrix-grid">
                <div className="matrix-column teach">
                  <div className="matrix-header">
                    <GraduationCap size={16} /> <span>Skill Offered</span>
                  </div>
                  <div className="matrix-list">
                    {post.willTeach?.map((skill, index) => (
                      <div key={index} className="matrix-item">
                        <span className="matrix-skill">{skill.customSkillName || skill.skill?.name}</span>
                        <span className="matrix-level">{skill.level?.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="matrix-column learn">
                  <div className="matrix-header">
                    <BookOpen size={16} /> <span>Wants to Learn</span>
                  </div>
                  <div className="matrix-list">
                    {post.wantToLearn?.map((skill, index) => (
                      <div key={index} className="matrix-item">
                        <span className="matrix-skill">{skill.customSkillName || skill.skill?.name}</span>
                        <span className="matrix-level">{skill.level?.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="ledger-section">
              <div className="section-header">
                <span className="section-number">01.2</span>
                <h2 className="section-title">SPECIFICATIONS</h2>
              </div>
              <p className="description-text-editorial">{post.description}</p>
            </section>

            {post.requirements && post.requirements.length > 0 && (
              <section className="ledger-section">
                <div className="section-header">
                  <span className="section-number">01.3</span>
                  <h2 className="section-title">PREREQUISITES</h2>
                </div>
                <ul className="editorial-check-list">
                  {post.requirements.map((req, index) => (
                    <li key={index}><ArrowRight size={12} /> {req}</li>
                  ))}
                </ul>
              </section>
            )}

            {post.outcomes && post.outcomes.length > 0 && (
              <section className="ledger-section">
                <div className="section-header">
                  <span className="section-number">01.4</span>
                  <h2 className="section-title">What You'll Get</h2>
                </div>
                <ul className="editorial-check-list">
                  {post.outcomes.map((outcome, index) => (
                    <li key={index}><Target size={12} /> {outcome}</li>
                  ))}
                </ul>
              </section>
            )}

            <div className="ledger-meta-grid">
              {(post.duration || post.maxParticipants) && (
                <div className="meta-nodal-card">
                  <div className="meta-card-header">
                    <Info size={14} /> <span>Details</span>
                  </div>
                  <div className="meta-data-rows">
                    {post.duration && (
                      <div className="meta-data-row">
                        <Clock size={14} />
                        <span className="meta-label">Session Length</span>
                        <span className="meta-value">{post.duration} MIN</span>
                      </div>
                    )}
                    {post.maxParticipants && (
                      <div className="meta-data-row">
                        <Users size={14} />
                        <span className="meta-label">MAX_CAPACITY</span>
                        <span className="meta-value">{post.maxParticipants} NODES</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="meta-nodal-card">
                  <div className="meta-card-header">
                    <Tag size={14} /> <span>Tags</span>
                  </div>
                  <div className="tags-nodal-cluster">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="nodal-tag">{tag.toUpperCase()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="skills-ledger">
            <section className="ledger-section">
              <div className="section-header">
                <span className="section-number">02.1</span>
                <h2 className="section-title">About This Offer</h2>
              </div>
              <div className="skills-editorial-grid">
                {post.willTeach?.map((skill, index) => (
                  <div key={index} className="skill-nodal-profile teach">
                    <div className="profile-header">
                      <h3>{skill.customSkillName || skill.skill?.name}</h3>
                      <span className="level-badge-nodal">{skill.level?.toUpperCase()}</span>
                    </div>
                    {skill.description && <p className="profile-desc">{skill.description}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="ledger-section">
              <div className="section-header">
                <span className="section-number">02.2</span>
                <h2 className="section-title">Learning Goals</h2>
              </div>
              <div className="skills-editorial-grid">
                {post.wantToLearn?.map((skill, index) => (
                  <div key={index} className="skill-nodal-profile learn">
                    <div className="profile-header">
                      <h3>{skill.customSkillName || skill.skill?.name}</h3>
                      <span className="level-badge-nodal">{skill.level?.toUpperCase()}</span>
                    </div>
                    {skill.description && <p className="profile-desc">{skill.description}</p>}
                  </div>
                ))}
              </div>
            </section>

            {!isOwner && (
              <div className="match-callout-nodal">
                <div className="callout-content">
                  <Zap size={32} className="pulse" />
                  <div className="callout-text">
                    <h3>You're a great match!</h3>
                    <p>Think you're a good fit? Send them a proposal and get the skill exchange started.</p>
                  </div>
                  <button className="btn-propose-primary" onClick={handleProposeSkillTrade}>
                    Send a Proposal <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-ledger">
            <section className="ledger-section">
              <div className="creator-profile-nodal">
                <div className="profile-hero">
                  <img
                    src={post.user?.avatar || '/default-avatar.png'}
                    alt={post.user?.name}
                    className="nodal-avatar-large"
                  />
                  <div className="profile-identity">
                    <h2 className="creator-title">{post.user?.name || 'Unknown User'}</h2>
                    <div className="creator-metrics">
                      <div className="metric-box">
                        <span className="metric-label">Rating</span>
                        <span className="metric-value">
                          <Star size={14} fill="var(--accent)" /> {post.user?.rating?.average?.toFixed(1) || 'NEW'}
                        </span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-label">Trades Done</span>
                        <span className="metric-value">{post.user?.rating?.count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {post.user?.bio && (
                  <div className="profile-bio-section">
                    <span className="label-minimal">About</span>
                    <p className="description-text-editorial">{post.user.bio}</p>
                  </div>
                )}
                <div className="profile-actions">
                  <button className="btn-secondary-nodal" onClick={() => navigate(`/profile/${post.user._id}`)}>
                    View Profile <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

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
