import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { updateUserProfile, getMyCourses, getMyPosts, getMyTrades } from '../services/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myCourses, setMyCourses] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [myTrades, setMyTrades] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        location: user.location || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
      });
    }
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's content
      const [courses, posts, trades] = await Promise.all([
        getMyCourses().catch(() => []),
        getMyPosts().catch(() => []),
        getMyTrades().catch(() => []),
      ]);
      
      setMyCourses(Array.isArray(courses) ? courses.slice(0, 6) : []);
      setMyPosts(Array.isArray(posts) ? posts.slice(0, 6) : []);
      setMyTrades(Array.isArray(trades) ? trades.slice(0, 6) : []);
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Failed to load some profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await updateUserProfile(formData);
      updateUser(updated);
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-main">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {formData.avatar ? (
                <img src={formData.avatar} alt={formData.name} />
              ) : (
                <div className="avatar-placeholder">
                  {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>

          <div className="profile-info">
            <div className="profile-name-section">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="edit-name-input"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="profile-name">{formData.name}</h1>
              )}
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-edit-profile">
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="edit-bio-textarea"
                placeholder="Write a short bio about yourself..."
                rows="3"
              />
            ) : (
              <p className="profile-bio">{formData.bio || 'No bio yet'}</p>
            )}

            {/* Stats */}
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{myCourses.length}</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{myPosts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{myTrades.length}</span>
                <span className="stat-label">Trades</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user?.coins || 0}</span>
                <span className="stat-label">Coins</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{user?.rating?.toFixed(1) || '0.0'}</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>

            {isEditing && (
              <div className="edit-actions">
                <button onClick={handleSaveProfile} className="btn btn-save">
                  Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-cancel">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button
          className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Courses ({myCourses.length})
        </button>
        <button
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({myPosts.length})
        </button>
        <button
          className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
          onClick={() => setActiveTab('trades')}
        >
          Trades ({myTrades.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === 'about' && (
          <div className="about-section">
            <div className="info-card">
              <h3>📧 Contact Information</h3>
              {isEditing ? (
                <>
                  <div className="info-row">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className="edit-input"
                    />
                  </div>
                  <div className="info-row">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      className="edit-input"
                    />
                  </div>
                  <div className="info-row">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="edit-input"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p><strong>Email:</strong> {formData.email}</p>
                  {formData.location && <p><strong>Location:</strong> {formData.location}</p>}
                  {formData.website && (
                    <p>
                      <strong>Website:</strong>{' '}
                      <a href={formData.website} target="_blank" rel="noopener noreferrer">
                        {formData.website}
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="info-card">
              <h3>🔗 Social Links</h3>
              {isEditing ? (
                <>
                  <div className="info-row">
                    <label>LinkedIn</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="edit-input"
                    />
                  </div>
                  <div className="info-row">
                    <label>GitHub</label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username"
                      className="edit-input"
                    />
                  </div>
                </>
              ) : (
                <>
                  {formData.linkedin && (
                    <p>
                      <strong>LinkedIn:</strong>{' '}
                      <a href={formData.linkedin} target="_blank" rel="noopener noreferrer">
                        View Profile
                      </a>
                    </p>
                  )}
                  {formData.github && (
                    <p>
                      <strong>GitHub:</strong>{' '}
                      <a href={formData.github} target="_blank" rel="noopener noreferrer">
                        View Profile
                      </a>
                    </p>
                  )}
                  {!formData.linkedin && !formData.github && <p>No social links added yet</p>}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-grid">
            {myCourses.length > 0 ? (
              myCourses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="course-thumbnail">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} />
                    ) : (
                      <div className="thumbnail-placeholder">📚</div>
                    )}
                  </div>
                  <div className="course-info">
                    <h4>{course.title}</h4>
                    <p>{course.description?.substring(0, 100)}...</p>
                    <div className="course-meta">
                      <span className="course-level">{course.level}</span>
                      <span className="course-views">{course.stats?.views || 0} views</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No courses created yet</p>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="posts-grid">
            {myPosts.length > 0 ? (
              myPosts.map((post) => (
                <div key={post._id} className="post-card-mini">
                  <h4>{post.title}</h4>
                  <p>{post.description?.substring(0, 150)}...</p>
                  <div className="post-meta">
                    <span className="post-type">{post.type}</span>
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No posts created yet</p>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="trades-list">
            {myTrades.length > 0 ? (
              myTrades.map((trade) => (
                <div key={trade._id} className="trade-item">
                  <div className="trade-info">
                    <h4>{trade.skill?.name}</h4>
                    <p>
                      {trade.teacher._id === user._id ? 'Teaching' : 'Learning'} - {trade.status}
                    </p>
                    <span className="trade-date">{new Date(trade.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="trade-coins">{trade.coinsAmount} 💰</span>
                </div>
              ))
            ) : (
              <p className="empty-state">No trades yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
