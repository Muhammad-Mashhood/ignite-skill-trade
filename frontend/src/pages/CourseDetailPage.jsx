import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Lock, 
  User, 
  Star, 
  PlayCircle, 
  FileText, 
  Users, 
  Eye, 
  Mic, 
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getCourseById, enrollInCourse, rateCourse } from '../services/api';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  
  useEffect(() => {
    fetchCourse();
  }, [id]);
  
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await getCourseById(id);
      
      setCourse(response.data);
      setHasAccess(response.hasAccess);
      
      if (response.data.enrollments && user) {
        const enrollment = response.data.enrollments.find(e => e.user === user.uid || e.user._id === user.uid);
        setIsEnrolled(!!enrollment);
      }
      
      if (response.hasAccess && response.data.videos && response.data.videos.length > 0) {
        setCurrentVideo(response.data.videos[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      showError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnroll = async () => {
    try {
      await enrollInCourse(id);
      showSuccess('Successfully enrolled in course!');
      setIsEnrolled(true);
      fetchCourse();
    } catch (error) {
      console.error('Error enrolling:', error);
      showError(error.message || 'Failed to enroll in course');
    }
  };
  
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!isEnrolled) {
      showError('You must be enrolled to rate this course');
      return;
    }
    try {
      setSubmittingRating(true);
      await rateCourse(id, rating, review);
      showSuccess('Rating submitted successfully!');
      setShowRatingForm(false);
      setReview('');
      fetchCourse();
    } catch (error) {
      console.error('Error submitting rating:', error);
      showError(error.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };
  
  const isInstructor = user && course && (user.uid === (course.instructor?._id || course.instructor));
  
  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="loading-container">
          <div className="nodal-loader"></div>
          <p className="nodal-loader-text">INITIALIZING ASSETS</p>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="course-detail-page">
        <div className="error-container">
          <h2 className="editorial-title">Course Not Found</h2>
          <button className="btn-back-nodal" onClick={() => navigate('/courses')}>
            <ChevronLeft size={16} /> Back to Courses
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="course-detail-page">
      {/* Hero Header */}
      <div className="course-detail-hero">
        <div className="hero-nodal-nav">
          <button className="btn-back-nodal" onClick={() => navigate('/courses')}>
            <ChevronLeft size={14} /> Back
          </button>
        </div>
        
        <div className="hero-content">
          <div className="hero-labels">
            <span className="editorial-label">{course.category?.toUpperCase()}</span>
            <span className="separator">•</span>
            <span className="editorial-label">{course.level?.toUpperCase()}</span>
          </div>
          <h1 className="editorial-title">{course.title}</h1>
          
          <div className="course-nodal-meta">
            <div className="instructor-nodal">
              <img
                src={course.instructor?.avatar || '/default-avatar.png'}
                alt={course.instructor?.name}
                className="nodal-avatar-small"
              />
              <div className="instructor-text">
                <span className="label-minimal">INSTRUCTOR</span>
                <Link to={`/profile/${course.instructor?._id}`} className="instructor-link">
                  {course.instructor?.name}
                </Link>
              </div>
            </div>
            
            <div className="rating-nodal">
              <Star size={16} fill="var(--accent)" color="var(--accent)" />
              <span className="rating-value">{course.stats?.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="rating-count">({course.stats?.ratingCount || 0} REVIEWS)</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Access Denied Banner */}
      {!hasAccess && !isInstructor && (
        <div className="access-denied-nodal">
          <div className="lock-cluster">
            <Lock size={32} />
          </div>
          <div className="access-text">
            <h2 className="nodal-title">ASSET ENCRYPTION ACTIVE</h2>
            <p className="ledger-desc">
              Full curriculum access requires a verified trade with <strong>{course.instructor?.name}</strong>.
            </p>
          </div>
          <div className="access-actions">
            <Link to={`/profile/${course.instructor?._id}`} className="btn-access-primary">
              NEGOTIATE TRADE <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
      
      <div className="course-detail-layout">
        <main className="course-main">
          {/* Video Player Section */}
          <section className="video-section-nodal">
            {hasAccess || isInstructor ? (
              <div className="player-container">
                {currentVideo ? (
                  <>
                    <div className="video-aspect-wrapper">
                      <video
                        controls
                        key={currentVideo._id}
                        className="main-video-player"
                      >
                        <source src={currentVideo.url} type="video/mp4" />
                      </video>
                    </div>
                    
                    <div className="video-header-nodal">
                      <div className="video-identity">
                        <span className="video-index">CLIP_{String(course.videos.indexOf(currentVideo) + 1).padStart(2, '0')}</span>
                        <h3 className="video-title-active">{currentVideo.title}</h3>
                      </div>
                      
                      {currentVideo.hasDubbing && currentVideo.dubbedAudioUrl && (
                        <div className="signal-translation-card">
                          <div className="signal-header">
                            <Mic size={14} />
                            <span className="signal-label">URDU SIGNAL OVERLAY</span>
                          </div>
                          <audio controls className="nodal-audio-player">
                            <source src={currentVideo.dubbedAudioUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-player-state">
                    <PlayCircle size={48} opacity={0.2} />
                    <p>SELECT A MODULE TO BEGIN PLAYBACK</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="locked-player-state">
                <div className="locked-overlay">
                  <Lock size={48} />
                  <p className="nodal-loader-text">MODULES ENCRYPTED</p>
                  <p className="label-minimal">COMPLETE TRADE TO UNLOCK DATA</p>
                </div>
              </div>
            )}
          </section>
          
          {/* About Section */}
          <section className="ledger-section">
            <div className="section-header">
              <span className="section-number">01</span>
              <h2 className="section-title">CURRICULUM SPECIFICATIONS</h2>
            </div>
            <p className="course-description-text">{course.description}</p>
            
            {course.skills && course.skills.length > 0 && (
              <div className="skills-nodal-cluster">
                <span className="label-minimal">CORE COMPETENCIES</span>
                <div className="skills-tags">
                  {course.skills.map(skill => (
                    <span key={skill._id || skill} className="nodal-tag">
                      {skill.name || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
          
          {/* Materials Section */}
          {(hasAccess || isInstructor) && course.documents && course.documents.length > 0 && (
            <section className="ledger-section">
              <div className="section-header">
                <span className="section-number">02</span>
                <h2 className="section-title">ASSET REPOSITORY</h2>
              </div>
              <div className="asset-ledger-list">
                {course.documents.map((doc, index) => (
                  <a
                    key={doc._id || index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="asset-ledger-item"
                  >
                    <div className="asset-type-indicator">
                      <FileText size={18} />
                    </div>
                    <div className="asset-content">
                      <span className="asset-name">{doc.title}</span>
                      <span className="asset-meta">{doc.fileType?.toUpperCase()}</span>
                    </div>
                    <ArrowRight size={14} className="asset-arrow" />
                  </a>
                ))}
              </div>
            </section>
          )}
          
          {/* Reviews Section */}
          <section className="ledger-section">
            <div className="section-header">
              <span className="section-number">03</span>
              <h2 className="section-title">STAKEHOLDER FEEDBACK</h2>
              {isEnrolled && (hasAccess || isInstructor) && (
                <button
                  className="btn-add-review-nodal"
                  onClick={() => setShowRatingForm(!showRatingForm)}
                >
                  {showRatingForm ? 'CANCEL' : 'ADD REVIEW'}
                </button>
              )}
            </div>
            
            {showRatingForm && (
              <form onSubmit={handleSubmitRating} className="rating-nodal-form">
                <div className="rating-input-cluster">
                  <span className="label-minimal">RATING_INDEX</span>
                  <div className="star-rating-nodal">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`nodal-star ${rating >= star ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        <Star size={20} fill={rating >= star ? 'var(--accent)' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="review-input-cluster">
                  <span className="label-minimal">COMMENTS</span>
                  <textarea
                    className="textarea-nodal"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Provide technical feedback..."
                    rows={4}
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-submit-nodal"
                  disabled={submittingRating}
                >
                  {submittingRating ? 'TRANSMITTING...' : 'SUBMIT FEEDBACK'}
                </button>
              </form>
            )}
            
            <div className="reviews-ledger">
              {course.ratings && course.ratings.length > 0 ? (
                course.ratings.map((rating, index) => (
                  <div key={index} className="review-nodal-card">
                    <div className="review-meta">
                      <img
                        src={rating.user?.avatar || '/default-avatar.png'}
                        alt={rating.user?.name}
                        className="nodal-avatar-tiny"
                      />
                      <div className="review-user-info">
                        <span className="review-username">{rating.user?.name || 'ANONYMOUS'}</span>
                        <span className="review-date">{new Date(rating.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="review-stars-nodal">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            fill={i < rating.rating ? 'var(--text-primary)' : 'none'} 
                            color={i < rating.rating ? 'var(--text-primary)' : 'var(--border)'} 
                          />
                        ))}
                      </div>
                    </div>
                    {rating.review && <p className="review-text-nodal">{rating.review}</p>}
                  </div>
                ))
              ) : (
                <div className="empty-reviews-state">
                  <p className="label-minimal">NO FEEDBACK REGISTERED FOR THIS ASSET</p>
                </div>
              )}
            </div>
          </section>
        </main>
        
        <aside className="course-sidebar">
          {/* Action Card */}
          {!isInstructor && (
            <div className="action-card-nodal">
              <div className="price-nodal">
                <span className="label-minimal">INVESTMENT</span>
                <div className="price-values">
                  <span className="coins-value">{course.coinsRequired} COINS</span>
                  {course.price > 0 && <span className="cash-value">${course.price}</span>}
                </div>
              </div>
              
              {isEnrolled ? (
                <div className="enrolled-status">
                  <CheckCircle size={14} /> ACCESS GRANTED
                </div>
              ) : hasAccess ? (
                <button className="btn-enroll-nodal" onClick={handleEnroll}>
                  ENROLL IN CURRICULUM
                </button>
              ) : (
                <div className="enroll-locked-nodal">
                  <Lock size={14} /> TRADING REQUIRED
                </div>
              )}
            </div>
          )}
          
          {/* Metadata Card */}
          <div className="metadata-card-nodal">
            <h3 className="metadata-title">METRIC_REPORT</h3>
            <div className="metadata-ledger">
              <div className="metadata-row">
                <div className="meta-label-box">
                  <Eye size={12} /> <span>VIEWS</span>
                </div>
                <span className="meta-value">{course.stats?.views || 0}</span>
              </div>
              <div className="metadata-row">
                <div className="meta-label-box">
                  <Users size={12} /> <span>STUDENTS</span>
                </div>
                <span className="meta-value">{course.stats?.enrollmentCount || 0}</span>
              </div>
              <div className="metadata-row">
                <div className="meta-label-box">
                  <PlayCircle size={12} /> <span>MODULES</span>
                </div>
                <span className="meta-value">{course.videos?.length || 0}</span>
              </div>
              <div className="metadata-row">
                <div className="meta-label-box">
                  <FileText size={12} /> <span>ASSETS</span>
                </div>
                <span className="meta-value">{course.documents?.length || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Playlist Section */}
          {course.videos && course.videos.length > 0 && (
            <div className="playlist-card-nodal">
              <h3 className="metadata-title">MODULE_SEQUENCER</h3>
              <div className="playlist-sequencer">
                {course.videos.map((video, index) => (
                  <div
                    key={video._id || index}
                    className={`sequencer-item ${currentVideo?._id === video._id ? 'active' : ''} ${!hasAccess && !isInstructor ? 'locked' : ''}`}
                    onClick={() => (hasAccess || isInstructor) && setCurrentVideo(video)}
                  >
                    <div className="item-prefix">
                      {currentVideo?._id === video._id ? <PlayCircle size={14} className="pulse" /> : String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="item-content">
                      <span className="item-title">{video.title}</span>
                      <div className="item-badges">
                        {video.hasDubbing && <Mic size={10} />}
                        {!hasAccess && !isInstructor && <Lock size={10} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CourseDetailPage;
