import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Repeat, 
  Trash2, 
  Star, 
  Zap, 
  Search, 
  BookOpen, 
  Clock, 
  Users, 
  Eye, 
  ChevronRight,
  ArrowRight,
  BadgeCheck,
  Target
} from 'lucide-react';
import './PostCard.css';

const PostCard = ({ post, onInterestToggle, onDelete, isOwner }) => {
  const navigate = useNavigate();

  const handleInterestToggle = async (e) => {
    e.stopPropagation();
    if (onInterestToggle) {
      await onInterestToggle(post._id);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (onDelete) {
        await onDelete(post._id);
      }
    }
  };

  const handleCardClick = () => {
    navigate(`/posts/${post._id}`);
  };

  const getTypeLabel = (type) => {
    if (type === 'trade') return 'Skill Swap';
    return type.toUpperCase();
  };

  return (
    <article className="post-nodal-card" onClick={handleCardClick}>
      <header className="card-nodal-header">
        <div className="type-indicator-nodal">
          <span className="type-label-nodal">{getTypeLabel(post.type)}</span>
          <span className="type-id-nodal">PRT_{post._id?.substring(0, 4)}</span>
        </div>
        {isOwner && (
          <button className="btn-delete-nodal" onClick={handleDelete} title="Delete">
            <Trash2 size={14} />
          </button>
        )}
      </header>

      <div className="card-nodal-body">
        <div className="creator-profile-compact">
          <div className="avatar-nodal-wrapper">
            {post.user?.avatar ? (
              <img src={post.user.avatar} alt={post.user.name} className="avatar-nodal-sm" />
            ) : (
              <div className="avatar-initials-nodal">
                {post.user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="verification-badge-nodal">
              <BadgeCheck size={12} fill="var(--accent)" stroke="#000" />
            </div>
          </div>
          <div className="creator-info-nodal">
            <span className="creator-name-nodal">{post.user?.name || 'Anonymous'}</span>
            <div className="creator-trust-nodal">
              <Star size={10} fill="var(--accent)" stroke="var(--accent)" />
              <span>{post.user?.rating?.average?.toFixed(1) || '0.0'} Rating</span>
            </div>
          </div>
        </div>

        <h3 className="card-title-editorial">{post.title}</h3>
        <p className="card-desc-editorial">{post.description?.substring(0, 120)}...</p>

        <div className="skill-matrix-compact">
          {post.willTeach && post.willTeach.length > 0 && (
            <div className="skill-vector-column teach">
              <div className="vector-label-nodal">
                <Zap size={10} />
                <span>Offers</span>
              </div>
              <div className="skill-tag-cluster">
                {post.willTeach.slice(0, 2).map((skill, index) => (
                  <span key={index} className="skill-tag-nodal teach">
                    {skill.customSkillName || skill.skill?.name}
                  </span>
                ))}
                {post.willTeach.length > 2 && (
                  <span className="skill-tag-count">+{post.willTeach.length - 2}</span>
                )}
              </div>
            </div>
          )}

          {post.wantToLearn && post.wantToLearn.length > 0 && (
            <div className="skill-vector-column learn">
              <div className="vector-label-nodal">
                <Search size={10} />
                <span>Seeks</span>
              </div>
              <div className="skill-tag-cluster">
                {post.wantToLearn.slice(0, 2).map((skill, index) => (
                  <span key={index} className="skill-tag-nodal learn">
                    {skill.customSkillName || skill.skill?.name}
                  </span>
                ))}
                {post.wantToLearn.length > 2 && (
                  <span className="skill-tag-count">+{post.wantToLearn.length - 2}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {post.linkedCourse && (
          <div className="linked-curriculum-nodal">
            <BookOpen size={14} className="accent-text" />
            <span className="curriculum-title">{post.linkedCourse.title}</span>
            <ChevronRight size={14} className="curriculum-arrow" />
          </div>
        )}
      </div>

      <footer className="card-nodal-footer">
        <div className="telemetry-cluster-nodal">
          <div className="telemetry-item-nodal">
            <Eye size={12} />
            <span>{post.stats?.views || 0}</span>
          </div>
          <div className="telemetry-item-nodal">
            <Clock size={12} />
            <span>{post.duration || '--'}m</span>
          </div>
          <div className="telemetry-item-nodal">
            <Star size={12} fill={post.isInterested ? "var(--accent)" : "none"} stroke={post.isInterested ? "var(--accent)" : "currentColor"} />
            <span>{post.stats?.interests || 0}</span>
          </div>
        </div>

        <div className="action-cluster-nodal">
          {!isOwner ? (
            <button
              className={`btn-action-nodal ${post.isInterested ? 'active' : ''}`}
              onClick={handleInterestToggle}
            >
              <span>{post.isInterested ? 'Interested' : "I'm Interested"}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <div className="owner-badge-nodal">Your Post</div>
          )}
        </div>
      </footer>

      {post.status !== 'active' && (
        <div className="status-ribbon-nodal">
          <span>{post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span>
        </div>
      )}
    </article>
  );
};

export default PostCard;
