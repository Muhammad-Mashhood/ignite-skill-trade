import React from 'react';
import { useNavigate } from 'react-router-dom';
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

  const getTypeIcon = (type) => {
    if (type === 'trade') {
      return '�';
    }
    return '📌';
  };

  const getTypeLabel = (type) => {
    if (type === 'trade') {
      return 'Trade Skills';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="post-card" onClick={handleCardClick}>
      <div className="post-card-header">
        <div className="post-type-badge">
          <span className="post-type-icon">{getTypeIcon(post.type)}</span>
          <span className="post-type-label">{getTypeLabel(post.type)}</span>
        </div>
        {isOwner && (
          <button className="post-delete-btn" onClick={handleDelete} title="Delete post">
            🗑️
          </button>
        )}
      </div>

      {/* Creator Info */}
      <div className="post-creator">
        <div className="creator-avatar">
          {post.user?.avatar ? (
            <img src={post.user.avatar} alt={post.user.name} />
          ) : (
            <div className="avatar-placeholder">
              {post.user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="creator-info">
          <span className="creator-name">{post.user?.name || 'Anonymous'}</span>
          {post.user?.rating?.average > 0 && (
            <span className="creator-rating">
              ⭐ {post.user.rating.average.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <h3 className="post-title">{post.title}</h3>
      <p className="post-description">{post.description}</p>

      {/* Will Teach Skills */}
      {post.willTeach && post.willTeach.length > 0 && (
        <div className="skills-section">
          <div className="skills-header">
            <span className="skills-icon">�</span>
            <span className="skills-label">Will Teach</span>
          </div>
          <div className="skills-badges">
            {post.willTeach.slice(0, 3).map((skill, index) => (
              <span key={index} className="skill-badge teach-badge">
                {skill.customSkillName || skill.skill?.name}
                {skill.level && <span className="skill-level"> • {skill.level}</span>}
              </span>
            ))}
            {post.willTeach.length > 3 && (
              <span className="skill-badge-more">+{post.willTeach.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Want to Learn Skills */}
      {post.wantToLearn && post.wantToLearn.length > 0 && (
        <div className="skills-section">
          <div className="skills-header">
            <span className="skills-icon">📚</span>
            <span className="skills-label">Want to Learn</span>
          </div>
          <div className="skills-badges">
            {post.wantToLearn.slice(0, 3).map((skill, index) => (
              <span key={index} className="skill-badge learn-badge">
                {skill.customSkillName || skill.skill?.name}
                {skill.level && <span className="skill-level"> • {skill.level}</span>}
              </span>
            ))}
            {post.wantToLearn.length > 3 && (
              <span className="skill-badge-more">+{post.wantToLearn.length - 3} more</span>
            )}
          </div>
        </div>
      )}
      
      {/* Linked Course */}
      {post.linkedCourse && (
        <div className="linked-course-section">
          <div className="linked-course-badge">
            <span className="course-icon">📚</span>
            <span className="course-text">Includes Course: {post.linkedCourse.title}</span>
          </div>
          <button 
            className="view-course-btn" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${post.linkedCourse._id}`);
            }}
          >
            View Course →
          </button>
        </div>
      )}

      <div className="post-details">
        {post.duration && (
          <div className="post-detail">
            <span className="detail-icon">⏱️</span>
            <span>{post.duration} mins</span>
          </div>
        )}
        {post.maxParticipants && (
          <div className="post-detail">
            <span className="detail-icon">�</span>
            <span>Max {post.maxParticipants} people</span>
          </div>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="post-tag">
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && <span className="post-tag-more">+{post.tags.length - 3}</span>}
        </div>
      )}

      <div className="post-footer">
        <div className="post-stats">
          <span className="post-stat">
            👁️ {post.stats?.views || post.views || 0}
          </span>
          <span className="post-stat">
            ⭐ {post.stats?.interests || post.interestedUsers?.length || 0}
          </span>
        </div>
        {!isOwner && (
          <button
            className={`interest-btn ${post.isInterested ? 'interested' : ''}`}
            onClick={handleInterestToggle}
          >
            {post.isInterested ? '⭐ Interested' : '☆ Show Interest'}
          </button>
        )}
      </div>

      {post.status !== 'active' && (
        <div className="post-status-overlay">
          <span className="status-badge">{post.status}</span>
        </div>
      )}
    </div>
  );
};

export default PostCard;
