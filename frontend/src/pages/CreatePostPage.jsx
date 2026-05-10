import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Video, 
  BookOpen, 
  Clock, 
  Users, 
  Tag, 
  ClipboardList, 
  Target,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
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
    isOnlineSession: true,
    linkedCourse: '',
  });
  
  const [myCourses, setMyCourses] = useState([]);
  
  const [willTeach, setWillTeach] = useState([{
    skill: '',
    customSkillName: '',
    level: 'beginner',
    description: ''
  }]);
  
  const [wantToLearn, setWantToLearn] = useState([{
    skill: '',
    customSkillName: '',
    level: 'beginner',
    description: ''
  }]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
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
        level: formData.level || 'beginner',
        languages: ['English'],
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
        postData.maxStudents = parseInt(formData.maxParticipants);
      }
      
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
        {/* Editorial Header */}
        <div className="create-post-hero">
          <div className="hero-nodal-nav">
            <button type="button" className="btn-back-nodal" onClick={() => navigate('/posts')}>
              <ArrowLeft size={16} />
              <span>Back to Posts</span>
            </button>
          </div>
          <div className="hero-editorial-content">
            <div className="editorial-label">Post Type</div>
            <h1 className="editorial-title">Create a Post</h1>
            <p className="editorial-subtitle">Tell the community what you can teach and what you want to learn.</p>
          </div>
        </div>

        {error && (
          <div className="editorial-error-card">
            <AlertCircle size={20} />
            <div className="error-content">
              <span className="error-label">SYSTEM_ERROR</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-post-ledger">
          {/* Section 1: Core Identification */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">01</div>
              <h2 className="section-title">IDENTIFICATION</h2>
            </div>
            
            <div className="ledger-grid">
              <div className="form-group full-width">
                <label htmlFor="title">
                  <span className="label-text">SIGNAL TITLE</span>
                  <span className="label-required">REQUIRED</span>
                </label>
                <div className="input-nodal-wrapper">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., QUANTUM PHYSICS FOR JAZZ IMPROVISATION"
                    required
                    maxLength={100}
                    className="input-nodal"
                  />
                  <div className="input-character-status">
                    {formData.title.length}/100
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  <span className="label-text">SIGNAL PARAMETERS / DESCRIPTION</span>
                  <span className="label-required">REQUIRED</span>
                </label>
                <div className="input-nodal-wrapper">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe what you're offering or looking for..."
                    required
                    rows={6}
                    maxLength={2000}
                    className="textarea-nodal"
                  />
                  <div className="input-character-status">
                    {formData.description.length}/2000
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Modality */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">02</div>
              <h2 className="section-title">EXCHANGE MODALITY</h2>
            </div>

            <div className="modality-grid">
              <div 
                className={`modality-card ${formData.isOnlineSession ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, isOnlineSession: true, linkedCourse: '' }))}
              >
                <div className="card-status-bar"></div>
                <div className="card-header">
                  <Video size={24} className="card-icon" />
                  <div className="card-check">
                    <div className="check-circle"></div>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">REAL-TIME SIGNAL</h3>
                  <p className="card-desc">Synchronous video session for high-bandwidth knowledge transfer.</p>
                </div>
              </div>

              <div 
                className={`modality-card ${!formData.isOnlineSession ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, isOnlineSession: false }))}
              >
                <div className="card-status-bar"></div>
                <div className="card-header">
                  <BookOpen size={24} className="card-icon" />
                  <div className="card-check">
                    <div className="check-circle"></div>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">COURSE-BASED</h3>
                  <p className="card-desc">Asynchronous exchange linked to an existing structured curriculum.</p>
                </div>
              </div>
            </div>

            {!formData.isOnlineSession && (
              <div className="course-selection-ledger fadeIn">
                <div className="form-group full-width">
                  <label htmlFor="linkedCourse">
                    <span className="label-text">TARGET CURRICULUM</span>
                    <span className="label-required">REQUIRED</span>
                  </label>
                  <div className="select-nodal-wrapper">
                    <select
                      id="linkedCourse"
                      name="linkedCourse"
                      value={formData.linkedCourse}
                      onChange={handleChange}
                      required={!formData.isOnlineSession}
                      className="select-nodal"
                    >
                      <option value="">SELECT FROM ACTIVE CURRICULA...</option>
                      {myCourses.map(course => (
                        <option key={course._id} value={course._id}>
                          {course.title.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    {myCourses.length === 0 && (
                      <div className="nodal-info-strip">
                        <Info size={14} />
                        <span>No courses found. <a href="/courses/create">Create a course first</a></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Teaching Assets */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">03</div>
              <h2 className="section-title">TEACHING ASSETS</h2>
              <button type="button" onClick={addWillTeachSkill} className="btn-add-nodal">
                <Plus size={14} />
                <span>ADD ASSET</span>
              </button>
            </div>
            
            <div className="skills-nodal-grid">
              {willTeach.map((skill, index) => (
                <div key={index} className="skill-nodal-card teaching">
                  <div className="nodal-card-header">
                    <span className="nodal-id">ASSET_{String(index + 1).padStart(2, '0')}</span>
                    {willTeach.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWillTeach(index)}
                        className="btn-remove-nodal"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <div className="nodal-card-form">
                    <div className="form-group">
                      <label className="label-minimal">ASSET NAME</label>
                      <input
                        type="text"
                        value={skill.customSkillName}
                        onChange={(e) => updateWillTeach(index, 'customSkillName', e.target.value)}
                        placeholder="e.g., ADVANCED REACT"
                        required
                        className="input-minimal"
                      />
                    </div>

                    <div className="form-group">
                      <label className="label-minimal">MASTERY LEVEL</label>
                      <select
                        value={skill.level}
                        onChange={(e) => updateWillTeach(index, 'level', e.target.value)}
                        className="select-minimal"
                      >
                        <option value="beginner">BEGINNER</option>
                        <option value="intermediate">INTERMEDIATE</option>
                        <option value="advanced">ADVANCED</option>
                        <option value="expert">EXPERT</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label className="label-minimal">SPECIFICATIONS</label>
                      <textarea
                        value={skill.description}
                        onChange={(e) => updateWillTeach(index, 'description', e.target.value)}
                        placeholder="Core competencies and experience level..."
                        rows={2}
                        className="textarea-minimal"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Learning Objectives */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">04</div>
              <h2 className="section-title">LEARNING OBJECTIVES</h2>
              <button type="button" onClick={addWantToLearnSkill} className="btn-add-nodal">
                <Plus size={14} />
                <span>ADD OBJECTIVE</span>
              </button>
            </div>
            
            <div className="skills-nodal-grid">
              {wantToLearn.map((skill, index) => (
                <div key={index} className="skill-nodal-card learning">
                  <div className="nodal-card-header">
                    <span className="nodal-id">OBJ_{String(index + 1).padStart(2, '0')}</span>
                    {wantToLearn.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWantToLearn(index)}
                        className="btn-remove-nodal"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <div className="nodal-card-form">
                    <div className="form-group">
                      <label className="label-minimal">OBJECTIVE NAME</label>
                      <input
                        type="text"
                        value={skill.customSkillName}
                        onChange={(e) => updateWantToLearn(index, 'customSkillName', e.target.value)}
                        placeholder="e.g., SWIFT UI"
                        required
                        className="input-minimal"
                      />
                    </div>

                    <div className="form-group">
                      <label className="label-minimal">TARGET LEVEL</label>
                      <select
                        value={skill.level}
                        onChange={(e) => updateWantToLearn(index, 'level', e.target.value)}
                        className="select-minimal"
                      >
                        <option value="beginner">BEGINNER</option>
                        <option value="intermediate">INTERMEDIATE</option>
                        <option value="advanced">ADVANCED</option>
                        <option value="expert">EXPERT</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label className="label-minimal">ACQUISITION GOALS</label>
                      <textarea
                        value={skill.description}
                        onChange={(e) => updateWantToLearn(index, 'description', e.target.value)}
                        placeholder="What are your specific learning milestones?"
                        rows={2}
                        className="textarea-minimal"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Technical Details */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">05</div>
              <h2 className="section-title">TECHNICAL SPECIFICATIONS</h2>
            </div>

            <div className="ledger-grid">
              <div className="form-group">
                <label htmlFor="duration">
                  <div className="label-icon-row">
                    <Clock size={14} />
                    <span className="label-text">SESSION DURATION (MIN)</span>
                  </div>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="60"
                  min="15"
                  max="480"
                  className="input-nodal"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxParticipants">
                  <div className="label-icon-row">
                    <Users size={14} />
                    <span className="label-text">MAX CAPACITY</span>
                  </div>
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  placeholder="5"
                  min="1"
                  max="100"
                  className="input-nodal"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="tags">
                  <div className="label-icon-row">
                    <Tag size={14} />
                    <span className="label-text">CLASSIFICATION TAGS</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="PROGRAMMING, INTERFACE, DESIGN, SCALABILITY"
                  className="input-nodal"
                />
                <span className="form-hint">COMMA-SEPARATED VALUES</span>
              </div>

              <div className="form-group full-width">
                <label htmlFor="requirements">
                  <div className="label-icon-row">
                    <ClipboardList size={14} />
                    <span className="label-text">ENTRY REQUIREMENTS</span>
                  </div>
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="ONE PREREQUISITE PER LINE..."
                  rows={4}
                  className="textarea-nodal"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="outcomes">
                  <div className="label-icon-row">
                    <Target size={14} />
                    <span className="label-text">EXPECTED OUTCOMES</span>
                  </div>
                </label>
                <textarea
                  id="outcomes"
                  name="outcomes"
                  value={formData.outcomes}
                  onChange={handleChange}
                  placeholder="ONE MILESTONE PER LINE..."
                  rows={4}
                  className="textarea-nodal"
                />
              </div>
            </div>
          </div>

          <div className="ledger-actions">
            <button
              type="button"
              onClick={() => navigate('/posts')}
              className="btn-cancel-nodal"
              disabled={loading}
            >
              TERMINATE PROCESS
            </button>
            <button type="submit" className="btn-submit-nodal" disabled={loading}>
              {loading ? (
                <div className="btn-loading-state">
                  <div className="mini-loader"></div>
                  <span>INITIALIZING...</span>
                </div>
              ) : (
                <div className="btn-ready-state">
                  <Sparkles size={16} />
                  <span>Publish Post</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
