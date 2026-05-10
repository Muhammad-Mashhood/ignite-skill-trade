import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Mail, 
  Globe, 
  Link2, 
  Code2, 
  Edit3, 
  Calendar, 
  Star, 
  Zap, 
  BookOpen, 
  FileText, 
  Repeat, 
  CheckCircle,
  Plus,
  ArrowRight,
  ExternalLink,
  Save,
  X,
  BadgeCheck,
  Shield,
  Activity,
  Award
} from 'lucide-react';
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
      showError('Failed to load identity data');
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
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to load profile');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="editorial-loader">
          <div className="loader-bar"></div>
          <span className="loader-text">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Identity Hero */}
      <section className="profile-hero-nodal">
        <div className="hero-branding">
          <span className="identity-tag">Member Profile</span>
          <div className="hero-main">
            <div className="profile-avatar-nodal">
              {formData.avatar ? (
                <img src={formData.avatar} alt={formData.name} />
              ) : (
                <div className="avatar-placeholder">
                  <User size={64} strokeWidth={1} />
                </div>
              )}
              <div className="verification-nodal">
                <BadgeCheck size={20} fill="var(--accent)" stroke="#000" />
              </div>
            </div>

            <div className="profile-heading-nodal">
              {isEditing ? (
                <div className="edit-heading-nodal">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="editorial-input-h1"
                    placeholder="Your name"
                  />
                  <div className="edit-actions-nodal">
                    <button onClick={handleSaveProfile} className="btn-save-nodal">
                      <Save size={14} /> SAVE
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn-cancel-nodal">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="display-heading-nodal">
                  <h1 className="hero-title-nodal">{formData.name}</h1>
                  <button onClick={() => setIsEditing(true)} className="btn-edit-identity">
                    <Edit3 size={12} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
              
              <div className="identity-meta-row">
                <div className="meta-item-nodal">
                  <MapPin size={12} />
                  <span>{formData.location || 'Not set'}</span>
                </div>
                <div className="meta-item-nodal">
                  <Calendar size={12} />
                  <span>JOINED {new Date(user?.createdAt).getFullYear()}</span>
                </div>
                <div className="meta-item-nodal">
                  <Shield size={12} className="accent-text" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="identity-bio-nodal">
          <div className="bio-label">Bio</div>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="editorial-textarea"
              placeholder="Tell people a bit about yourself..."
              rows="4"
            />
          ) : (
            <p className="editorial-bio-text">
              {formData.bio || 'No bio added yet.'}
            </p>
          )}
        </div>
      </section>

      {/* Telemetry Matrix */}
      <section className="identity-telemetry">
        <div className="telemetry-grid-profile">
          <div className="telemetry-box">
            <span className="box-label">COURSES</span>
            <span className="box-value">{myCourses.length}</span>
            <span className="box-unit">Courses</span>
          </div>
          <div className="telemetry-box">
            <span className="box-label">POSTS</span>
            <span className="box-value">{myPosts.length}</span>
            <span className="box-unit">Posts</span>
          </div>
          <div className="telemetry-box">
            <span className="box-label">TRADES</span>
            <span className="box-value">{myTrades.length}</span>
            <span className="box-unit">EXCHANGES</span>
          </div>
          <div className="telemetry-box highlight">
            <span className="box-label">CAPITAL</span>
            <span className="box-value">{user?.coins || 0}</span>
            <span className="box-unit">Coins</span>
          </div>
          <div className="telemetry-box">
            <span className="box-label">REPUTATION</span>
            <span className="box-value">{user?.rating?.average?.toFixed(1) || '0.0'}</span>
            <span className="box-unit">Rating</span>
          </div>
        </div>
      </section>

      {/* Identity Interface */}
      <nav className="identity-tabs-nodal">
        <button
          className={`identity-tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <span>MISSION & ASSETS</span>
        </button>
        <button
          className={`identity-tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <span>CURRICULUMS</span>
          <span className="tab-count">{myCourses.length}</span>
        </button>
        <button
          className={`identity-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <span>SIGNALS</span>
          <span className="tab-count">{myPosts.length}</span>
        </button>
        <button
          className={`identity-tab ${activeTab === 'trades' ? 'active' : ''}`}
          onClick={() => setActiveTab('trades')}
        >
          <span>EXCHANGES</span>
          <span className="tab-count">{myTrades.length}</span>
        </button>
      </nav>

      {/* Identity Content Area */}
      <main className="identity-main-content">
        {activeTab === 'about' && (
          <div className="assets-nodal-grid">
            <div className="asset-module-nodal">
              <div className="module-header-nodal">
                <Mail size={14} />
                <span>COMMUNICATIONS</span>
              </div>
              <div className="module-body-nodal">
                <div className="data-entry-nodal">
                  <span className="entry-label">Email</span>
                  <span className="entry-value">{formData.email}</span>
                </div>
                <div className="data-entry-nodal">
                  <span className="entry-label">LOCATION</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="nodal-input-sm"
                    />
                  ) : (
                    <span className="entry-value">{formData.location || 'Not set'}</span>
                  )}
                </div>
                <div className="data-entry-nodal">
                  <span className="entry-label">WEBSITE</span>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="nodal-input-sm"
                    />
                  ) : (
                    formData.website ? (
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="entry-value link">
                        {formData.website} <ExternalLink size={10} />
                      </a>
                    ) : <span className="entry-value">OFFLINE</span>
                  )}
                </div>
              </div>
            </div>

            <div className="asset-module-nodal">
              <div className="module-header-nodal">
                <Globe size={14} />
                <span>Social Links</span>
              </div>
              <div className="module-body-nodal">
                <div className="data-entry-nodal">
                  <span className="entry-label">LINKEDIN</span>
                  {isEditing ? (
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="nodal-input-sm"
                    />
                  ) : (
                    formData.linkedin ? (
                      <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="entry-value link">
                        <Link2 size={12} /> PROFILE <ExternalLink size={10} />
                      </a>
                    ) : <span className="entry-value">OFFLINE</span>
                  )}
                </div>
                <div className="data-entry-nodal">
                  <span className="entry-label">GITHUB</span>
                  {isEditing ? (
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className="nodal-input-sm"
                    />
                  ) : (
                    formData.github ? (
                      <a href={formData.github} target="_blank" rel="noopener noreferrer" className="entry-value link">
                        <Code2 size={12} /> REPOSITORY <ExternalLink size={10} />
                      </a>
                    ) : <span className="entry-value">OFFLINE</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="identity-grid-view">
            {myCourses.length > 0 ? (
              <div className="nodal-editorial-grid">
                {myCourses.map((course) => (
                  <article key={course._id} className="nodal-article-card">
                    <div className="article-media">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} />
                      ) : (
                        <div className="placeholder-nodal">
                          <BookOpen size={32} strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div className="article-content">
                      <span className="article-tag">{course.level.toUpperCase()}</span>
                      <h4 className="article-title">{course.title}</h4>
                      <div className="article-footer">
                        <span>{course.stats?.views || 0} AUDIENCE</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-identity-state">
                <BookOpen size={48} strokeWidth={1} />
                <p>No courses yet.</p>
                <button className="btn-nodal-ghost" onClick={() => navigate('/create-course')}>
                  <Plus size={14} /> <span>Add</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="identity-grid-view">
            {myPosts.length > 0 ? (
              <div className="nodal-editorial-grid">
                {myPosts.map((post) => (
                  <article key={post._id} className="nodal-signal-card">
                    <div className="signal-meta">
                      <span className="signal-type">{post.type.toUpperCase()}</span>
                      <span className="signal-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="signal-title">{post.title}</h4>
                    <p className="signal-excerpt">{post.description?.substring(0, 100)}...</p>
                    <div className="signal-footer">
                      <ArrowRight size={14} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-identity-state">
                <FileText size={48} strokeWidth={1} />
                <p>No posts yet.</p>
                <button className="btn-nodal-ghost" onClick={() => navigate('/create-post')}>
                  <Plus size={14} /> <span>New Post</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="identity-list-view">
            {myTrades.length > 0 ? (
              <div className="nodal-exchange-list">
                {myTrades.map((trade) => (
                  <div key={trade._id} className="exchange-ledger-row">
                    <div className="row-main">
                      <div className={`status-dot ${trade.status}`}></div>
                      <div className="row-info">
                        <h4 className="row-title">{trade.skill?.name}</h4>
                        <span className="row-subtitle">
                          {trade.teacher?._id === user._id ? 'INSTRUCTING' : 'ACQUIRING'} — {trade.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="row-value">
                      <Zap size={14} fill="var(--accent)" stroke="var(--accent)" />
                      <span>{trade.coinsAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-identity-state">
                <Repeat size={48} strokeWidth={1} />
                <p>No trades yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
