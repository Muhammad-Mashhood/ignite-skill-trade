import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, BookOpen, GraduationCap, AlertTriangle, Sparkles } from 'lucide-react';
import { createPost, getMyCourses } from '../services/api';
import './CreatePostPage.css';

const CreatePostPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    maxParticipants: '',
    tags: '',
    requirements: '',
    outcomes: '',
    isOnlineSession: true, // true = online session, false = course-based
    linkedCourse: '', // Course ID if course-based
  });
  
  const [myCourses, setMyCourses] = useState([]);
  
  // Will teach skills
  const [willTeach, setWillTeach] = useState([{
    skill: '',
    customSkillName: '',
    level: 'beginner',
    description: ''
  }]);
  
  // Want to learn skills (can be multiple)
  const [wantToLearn, setWantToLearn] = useState([{
    skill: '',
    customSkillName: '',
    level: 'beginner',
    description: ''
  }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Fetch user's courses on mount
  useEffect(() => {
    fetchMyCourses();
  }, []);
  
  const fetchMyCourses = async () => {
    try {
      const courses = await getMyCourses();
      setMyCourses(courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addWillTeachSkill = () => {
    setWillTeach([...willTeach, {
      skill: '',
      customSkillName: '',
      level: 'beginner',
      description: ''
    }]);
  };

  const updateWillTeach = (index, field, value) => {
    const updated = [...willTeach];
    updated[index][field] = value;
    setWillTeach(updated);
  };

  const removeWillTeach = (index) => {
    if (willTeach.length > 1) {
      setWillTeach(willTeach.filter((_, i) => i !== index));
    }
  };

  const addWantToLearnSkill = () => {
    setWantToLearn([...wantToLearn, {
      skill: '',
      customSkillName: '',
      level: 'beginner',
      description: ''
    }]);
  };

  const updateWantToLearn = (index, field, value) => {
    const updated = [...wantToLearn];
    updated[index][field] = value;
    setWantToLearn(updated);
  };

  const removeWantToLearn = (index) => {
    if (wantToLearn.length > 1) {
      setWantToLearn(wantToLearn.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const requirements = formData.requirements
        .split('\n')
        .map(req => req.trim())
        .filter(req => req);
      
      const outcomes = formData.outcomes
        .split('\n')
        .map(out => out.trim())
        .filter(out => out);

      const postData = {
        type: 'trade',
        title: formData.title,
        description: formData.description,
        tags,
        requirements,
        outcomes,
        level: formData.level || 'beginner', // Add level field
        languages: ['English'], // Default language
        willTeach: willTeach.filter(skill => skill.customSkillName.trim() !== ''),
        wantToLearn: wantToLearn.filter(skill => skill.customSkillName.trim() !== ''),
        stats: {
          views: 0,
          interests: 0,
          shares: 0,
        },
      };

      if (formData.duration) postData.duration = parseInt(formData.duration);
      if (formData.maxParticipants) {
        postData.maxParticipants = parseInt(formData.maxParticipants);
        postData.maxStudents = parseInt(formData.maxParticipants); // Both fields for compatibility
      }
      
      // Add linked course if course-based post
      if (!formData.isOnlineSession && formData.linkedCourse) {
        postData.linkedCourse = formData.linkedCourse;
      }

      await createPost(postData);
      navigate('/posts/my');
    } catch (err) {
      setError(err.message || 'Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <div className="create-post-header">
          <button className="back-btn" onClick={() => navigate('/posts')}>
            ← Back
          </button>
          <h1>Create Trade Skill Post</h1>
          <p>Share what you can teach and what you want to learn</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertTriangle size={16} aria-hidden="true" style={{display:'inline', verticalAlign:'middle', marginRight:'6px'}} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title">Post Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Trade Python Skills for Guitar Lessons"
              required
              maxLength={100}
              className="form-input"
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your skill trade offer in detail..."
              required
              rows={6}
              maxLength={2000}
              className="form-textarea"
            />
            <span className="char-count">{formData.description.length}/2000</span>
          </div>
          
          {/* Session Type Selection */}
          <div className="form-group">
            <label>Trade Type *</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="isOnlineSession"
                  checked={formData.isOnlineSession}
                  onChange={() => setFormData(prev => ({ ...prev, isOnlineSession: true, linkedCourse: '' }))}
                />
                <span><Video size={16} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'6px'}} /> Online Session</span>
                <small>Live video call sessions</small>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="isOnlineSession"
                  checked={!formData.isOnlineSession}
                  onChange={() => setFormData(prev => ({ ...prev, isOnlineSession: false }))}
                />
                <span><BookOpen size={16} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'6px'}} /> Course-Based</span>
                <small>Link to one of your courses</small>
              </label>
            </div>
          </div>
          
          {/* Course Selection (only if course-based) */}
          {!formData.isOnlineSession && (
            <div className="form-group">
              <label htmlFor="linkedCourse">Select Course *</label>
              <select
                id="linkedCourse"
                name="linkedCourse"
                value={formData.linkedCourse}
                onChange={handleChange}
                required={!formData.isOnlineSession}
                className="form-select"
              >
                <option value="">Choose a course...</option>
                {myCourses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {myCourses.length === 0 && (
                <small className="hint">
                  You don't have any courses yet. <a href="/courses/create">Create a course</a> first.
                </small>
              )}
            </div>
          )}

          {/* Will Teach Section */}
          <div className="skills-section will-teach-section">
            <div className="section-header">
              <h3><GraduationCap size={20} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'8px'}} /> Skills I Will Teach</h3>
              <button type="button" onClick={addWillTeachSkill} className="add-skill-btn">
                + Add Skill
              </button>
            </div>
            
            {willTeach.map((skill, index) => (
              <div key={index} className="skill-item">
                <div className="skill-item-header">
                  <h4>Skill {index + 1}</h4>
                  {willTeach.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWillTeach(index)}
                      className="remove-skill-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Skill Name *</label>
                  <input
                    type="text"
                    value={skill.customSkillName}
                    onChange={(e) => updateWillTeach(index, 'customSkillName', e.target.value)}
                    placeholder="e.g., Python Programming, Guitar, Cooking"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Skill Level *</label>
                  <select
                    value={skill.level}
                    onChange={(e) => updateWillTeach(index, 'level', e.target.value)}
                    className="form-select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={skill.description}
                    onChange={(e) => updateWillTeach(index, 'description', e.target.value)}
                    placeholder="What will you teach? What's your experience?"
                    rows={3}
                    className="form-textarea"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Want to Learn Section */}
          <div className="skills-section want-to-learn-section">
            <div className="section-header">
              <h3><BookOpen size={20} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'8px'}} /> Skills I Want to Learn</h3>
              <button type="button" onClick={addWantToLearnSkill} className="add-skill-btn">
                + Add Skill
              </button>
            </div>
            
            {wantToLearn.map((skill, index) => (
              <div key={index} className="skill-item">
                <div className="skill-item-header">
                  <h4>Skill {index + 1}</h4>
                  {wantToLearn.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWantToLearn(index)}
                      className="remove-skill-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Skill Name *</label>
                  <input
                    type="text"
                    value={skill.customSkillName}
                    onChange={(e) => updateWantToLearn(index, 'customSkillName', e.target.value)}
                    placeholder="e.g., Web Design, Japanese Language, Photography"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Desired Level *</label>
                  <select
                    value={skill.level}
                    onChange={(e) => updateWantToLearn(index, 'level', e.target.value)}
                    className="form-select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={skill.description}
                    onChange={(e) => updateWantToLearn(index, 'description', e.target.value)}
                    placeholder="What do you want to learn? What's your current level?"
                    rows={3}
                    className="form-textarea"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Details */}
          <div className="form-group">
            <label htmlFor="duration">Session Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 60"
              min="15"
              max="480"
              className="form-input"
            />
            <small className="form-hint">Suggested duration per session (15-480 minutes)</small>
          </div>

          <div className="form-group">
            <label htmlFor="maxParticipants">Max Participants</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="e.g., 5"
              min="1"
              max="100"
              className="form-input"
            />
            <small className="form-hint">Maximum number of people for group sessions (1-100)</small>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., programming, beginner-friendly, online"
              className="form-input"
            />
            <small className="form-hint">Separate multiple tags with commas</small>
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements (optional)</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="What should learners have or know? (one per line)"
              rows={4}
              className="form-textarea"
            />
            <small className="form-hint">Enter each requirement on a new line</small>
          </div>

          <div className="form-group">
            <label htmlFor="outcomes">Learning Outcomes (optional)</label>
            <textarea
              id="outcomes"
              name="outcomes"
              value={formData.outcomes}
              onChange={handleChange}
              placeholder="What will learners achieve? (one per line)"
              rows={4}
              className="form-textarea"
            />
            <small className="form-hint">Enter each outcome on a new line</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/posts')}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : <><Sparkles size={16} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'6px'}} /> Create Post</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
