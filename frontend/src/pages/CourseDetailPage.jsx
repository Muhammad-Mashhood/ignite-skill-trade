import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getCourseById, enrollInCourse, rateCourse } from '../services/api';
import './CourseDetailPage.css';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  
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
      
      // Check if user is enrolled
      if (response.data.enrollments && user) {
        const enrollment = response.data.enrollments.find(e => e.user === user.uid || e.user._id === user.uid);
        setIsEnrolled(!!enrollment);
      }
      
      // Set first video as current if has access
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
  
  const isInstructor = user && course && (user.uid === course.instructor._id || user.uid === course.instructor);
  
  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="course-detail-page">
        <div className="error-container">
          <h2>Course not found</h2>
          <button onClick={() => navigate('/courses')}>Browse Courses</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="course-detail-page">
      <div className="course-detail-container">
        {/* Header */}
        <div className="course-header">
          <div className="course-header-content">
            <div className="breadcrumb">
              <Link to="/courses">Courses</Link>
              <span>/</span>
              <span>{course.title}</span>
            </div>
            
            <h1>{course.title}</h1>
            
            <div className="course-meta-header">
              <div className="instructor-info">
                <img
                  src={course.instructor?.avatar || '/default-avatar.png'}
                  alt={course.instructor?.name || 'Instructor'}
                  className="instructor-avatar"
                />
                <div>
                  <p className="instructor-label">Instructor</p>
                  <Link
                    to={`/profile/${course.instructor._id}`}
                    className="instructor-name"
                  >
                    {course.instructor?.name || 'Unknown'}
                  </Link>
                </div>
              </div>
              
              <div className="course-badges">
                <span className="category-badge">{course.category}</span>
                <span className="level-badge">{course.level}</span>
              </div>
              
              <div className="course-rating">
                <span className="rating-value">⭐ {course.stats?.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="rating-count">({course.stats?.ratingCount || 0} ratings)</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Access Denied Message */}
        {!hasAccess && !isInstructor && (
          <div className="access-denied-banner">
            <div className="lock-icon">🔒</div>
            <div className="access-denied-content">
              <h2>This content is locked</h2>
              <p>
                Complete a trade with{' '}
                <Link to={`/profile/${course.instructor._id}`}>
                  {course.instructor?.name}
                </Link>
                {' '}to unlock this course and access all videos and materials.
              </p>
              <div className="access-denied-actions">
                <Link
                  to={`/profile/${course.instructor._id}`}
                  className="btn-view-profile"
                >
                  View Instructor Profile
                </Link>
                <Link to="/trades" className="btn-trades">
                  My Trades
                </Link>
              </div>
            </div>
          </div>
        )}
        
        <div className="course-content-layout">
          {/* Main Content */}
          <div className="main-content">
            {/* Video Player */}
            {hasAccess || isInstructor ? (
              <div className="video-section">
                {currentVideo ? (
                  <div className="video-player-container">
                    <video
                      controls
                      key={currentVideo._id}
                      className="video-player"
                    >
                      <source src={currentVideo.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    
                    <div className="video-info">
                      <h3>{currentVideo.title}</h3>
                      {currentVideo.hasDubbing && currentVideo.dubbedAudioUrl && (
                        <div className="urdu-audio-section">
                          <p className="audio-label">🎙️ Urdu Audio Track Available</p>
                          <audio controls className="urdu-audio-player">
                            <source src={currentVideo.dubbedAudioUrl} type="audio/mpeg" />
                            Your browser does not support the audio tag.
                          </audio>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-video">
                    <p>Select a video to start watching</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="locked-preview">
                <div className="locked-overlay">
                  <div className="lock-icon-large">🔒</div>
                  <p>Complete a trade to watch videos</p>
                </div>
              </div>
            )}
            
            {/* Description */}
            <div className="description-section">
              <h2>About This Course</h2>
              <p>{course.description}</p>
            </div>
            
            {/* Skills Covered */}
            {course.skills && course.skills.length > 0 && (
              <div className="skills-section">
                <h2>Skills You'll Learn</h2>
                <div className="skills-list">
                  {course.skills.map(skill => (
                    <span key={skill._id || skill} className="skill-tag">
                      {skill.name || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Documents */}
            {(hasAccess || isInstructor) && course.documents && course.documents.length > 0 && (
              <div className="documents-section">
                <h2>Course Materials</h2>
                <div className="documents-list">
                  {course.documents.map((doc, index) => (
                    <a
                      key={doc._id || index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-item"
                    >
                      <span className="doc-icon">📄</span>
                      <span className="doc-title">{doc.title}</span>
                      <span className="doc-type">{doc.fileType?.toUpperCase()}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Locked Documents Preview */}
            {!hasAccess && !isInstructor && course.documents && course.documents.length > 0 && (
              <div className="documents-section locked">
                <h2>Course Materials (Locked)</h2>
                <div className="documents-list">
                  {course.documents.map((doc, index) => (
                    <div key={doc._id || index} className="document-item locked">
                      <span className="doc-icon">🔒</span>
                      <span className="doc-title">{doc.title}</span>
                      <span className="doc-type">{doc.fileType?.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reviews */}
            <div className="reviews-section">
              <h2>Student Reviews</h2>
              
              {isEnrolled && (hasAccess || isInstructor) && (
                <button
                  className="btn-add-review"
                  onClick={() => setShowRatingForm(!showRatingForm)}
                >
                  {showRatingForm ? 'Cancel' : '+ Add Your Review'}
                </button>
              )}
              
              {showRatingForm && (
                <form onSubmit={handleSubmitRating} className="rating-form">
                  <div className="rating-input">
                    <label>Your Rating</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star ${rating >= star ? 'filled' : ''}`}
                          onClick={() => setRating(star)}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="review-input">
                    <label>Your Review (Optional)</label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your experience with this course..."
                      rows={4}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-submit-rating"
                    disabled={submittingRating}
                  >
                    {submittingRating ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
              
              {course.ratings && course.ratings.length > 0 ? (
                <div className="reviews-list">
                  {course.ratings.map((rating, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <img
                          src={rating.user?.avatar || '/default-avatar.png'}
                          alt={rating.user?.name || 'User'}
                          className="reviewer-avatar"
                        />
                        <div>
                          <p className="reviewer-name">{rating.user?.name || 'Anonymous'}</p>
                          <div className="review-rating">
                            {Array.from({ length: rating.rating }).map((_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                          </div>
                        </div>
                        <span className="review-date">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.review && <p className="review-text">{rating.review}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review this course!</p>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="sidebar">
            {/* Enroll Card */}
            {!isInstructor && (
              <div className="enroll-card">
                <div className="price-section">
                  <span className="coins-price">💰 {course.coinsRequired} Coins</span>
                  {course.price > 0 && (
                    <span className="money-price">${course.price}</span>
                  )}
                </div>
                
                {isEnrolled ? (
                  <div className="enrolled-badge">
                    ✓ You're Enrolled
                  </div>
                ) : hasAccess ? (
                  <button
                    className="btn-enroll"
                    onClick={handleEnroll}
                  >
                    Enroll Now
                  </button>
                ) : (
                  <div className="enroll-locked">
                    <p>🔒 Complete a trade to enroll</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Course Stats */}
            <div className="stats-card">
              <h3>Course Stats</h3>
              <div className="stat-row">
                <span className="stat-label">👁️ Views</span>
                <span className="stat-value">{course.stats?.views || 0}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">👥 Students</span>
                <span className="stat-value">{course.stats?.enrollmentCount || 0}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">📹 Videos</span>
                <span className="stat-value">{course.videos?.length || 0}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">📄 Documents</span>
                <span className="stat-value">{course.documents?.length || 0}</span>
              </div>
            </div>
            
            {/* Video Playlist */}
            {course.videos && course.videos.length > 0 && (
              <div className="playlist-card">
                <h3>Course Content</h3>
                <div className="playlist">
                  {course.videos.map((video, index) => (
                    <div
                      key={video._id || index}
                      className={`playlist-item ${currentVideo?._id === video._id ? 'active' : ''} ${!hasAccess && !isInstructor ? 'locked' : ''}`}
                      onClick={() => (hasAccess || isInstructor) && setCurrentVideo(video)}
                    >
                      <span className="video-number">{index + 1}</span>
                      <span className="video-title">{video.title}</span>
                      {!hasAccess && !isInstructor && <span className="lock">🔒</span>}
                      {video.hasDubbing && <span className="dubbing-badge">🎙️</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
