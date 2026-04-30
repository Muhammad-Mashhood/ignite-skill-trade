import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightLeft, Pin, Trash2, Star, Clock, Users,
  BookOpen, GraduationCap, Eye, Heart, ExternalLink
} from 'lucide-react';
import './PostCard.css';

const PostCard = ({ post, onInterestToggle, onDelete, isOwner }) => {
  const navigate = useNavigate();

  const handleInterestToggle = async (e) => {
    e.stopPropagation();
    if (onInterestToggle) await onInterestToggle(post._id);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      if (onDelete) await onDelete(post._id);
    }
  };

  const handleCardClick = () => navigate(`/posts/${post._id}`);

  const TypeIcon = post.type === 'trade' ? ArrowRightLeft : Pin;
  const typeLabel = post.type === 'trade' ? 'Trade Skills' : (post.type?.charAt(0).toUpperCase() + post.type?.slice(1));

  return (
    <article
      className="post-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      aria-label={`Post: ${post.title}`}
    >
      {/* Header */}
      <div className="post-card-header">
        <div className="post-type-badge">
          <TypeIcon size={13} aria-hidden="true" />
          <span>{typeLabel}</span>
        </div>
        {isOwner && (
          <button
            className="post-delete-btn"
            onClick={handleDelete}
            aria-label="Delete post"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Creator Info */}
      <div className="post-creator">
        <div className="creator-avatar">
          {post.user?.avatar ? (
            <img src={post.user.avatar} alt={`${post.user.name}'s avatar`} />
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
              <Star size={11} fill="#fbbf24" color="#fbbf24" aria-hidden="true" />
              {post.user.rating.average.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <h3 className="post-title">{post.title}</h3>
      <p className="post-description">{post.description}</p>

      {/* Will Teach Skills */}
      {post.willTeach?.length > 0 && (
        <div className="skills-section">
          <div className="skills-header">
            <GraduationCap size={13} aria-hidden="true" />
            <span>Will Teach</span>
          </div>
          <div className="skills-badges">
            {post.willTeach.slice(0, 3).map((skill, i) => (
              <span key={i} className="skill-badge teach-badge">
                {skill.customSkillName || skill.skill?.name}
                {skill.level && <span className="skill-level"> · {skill.level}</span>}
              </span>
            ))}
            {post.willTeach.length > 3 && (
              <span className="skill-badge-more">+{post.willTeach.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Want to Learn Skills */}
      {post.wantToLearn?.length > 0 && (
        <div className="skills-section">
          <div className="skills-header">
            <BookOpen size={13} aria-hidden="true" />
            <span>Want to Learn</span>
          </div>
          <div className="skills-badges">
            {post.wantToLearn.slice(0, 3).map((skill, i) => (
              <span key={i} className="skill-badge learn-badge">
                {skill.customSkillName || skill.skill?.name}
                {skill.level && <span className="skill-level"> · {skill.level}</span>}
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
            <BookOpen size={14} aria-hidden="true" />
            <span className="course-text">Includes: {post.linkedCourse.title}</span>
          </div>
          <button
            className="view-course-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${post.linkedCourse._id}`);
            }}
          >
            View
            <ExternalLink size={11} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Details */}
      <div className="post-details">
        {post.duration && (
          <div className="post-detail">
            <Clock size={13} aria-hidden="true" />
            <span>{post.duration} mins</span>
          </div>
        )}
        {post.maxParticipants && (
          <div className="post-detail">
            <Users size={13} aria-hidden="true" />
            <span>Max {post.maxParticipants}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="post-tags">
          {post.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="post-tag">{tag}</span>
          ))}
          {post.tags.length > 3 && <span className="post-tag-more">+{post.tags.length - 3}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="post-footer">
        <div className="post-stats">
          <span className="post-stat">
            <Eye size={13} aria-hidden="true" />
            {post.stats?.views || post.views || 0}
          </span>
          <span className="post-stat">
            <Heart size={13} aria-hidden="true" />
            {post.stats?.interests || post.interestedUsers?.length || 0}
          </span>
        </div>
        {!isOwner && (
          <button
            className={`interest-btn ${post.isInterested ? 'interested' : ''}`}
            onClick={handleInterestToggle}
            aria-pressed={!!post.isInterested}
          >
            <Star size={13} fill={post.isInterested ? 'currentColor' : 'none'} aria-hidden="true" />
            {post.isInterested ? 'Interested' : 'Show Interest'}
          </button>
        )}
      </div>

      {/* Status overlay */}
      {post.status !== 'active' && (
        <div className="post-status-overlay" aria-label={`Status: ${post.status}`}>
          <span className="status-badge">{post.status}</span>
        </div>
      )}
    </article>
  );
};

export default PostCard;
