import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { createCourse, updateCourse, getSkills, generateUrduDubbing } from '../services/api';
import { Hourglass, Video, Lightbulb, FileText } from 'lucide-react';
import './CreateCoursePage.css';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skills, setSkills] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: 0,
    coinsRequired: 50,
    selectedSkills: [],
  });
  
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  
  const [videos, setVideos] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  const categories = [
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Music',
    'Language',
    'Fitness',
    'Cooking',
    'Photography',
    'Other'
  ];
  
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  
  useEffect(() => {
    fetchSkills();
  }, []);
  
  const fetchSkills = async () => {
    try {
      const response = await getSkills();
      console.log('📚 Skills fetched:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setSkills(response);
      } else if (response.data && Array.isArray(response.data)) {
        setSkills(response.data);
      } else if (response.skills && Array.isArray(response.skills)) {
        setSkills(response.skills);
      } else {
        console.warn('⚠️ Unexpected skills response format:', response);
        setSkills([]);
      }
    } catch (error) {
      console.error('❌ Error fetching skills:', error);
      showError('Failed to load skills. Please refresh the page.');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillId)
        ? prev.selectedSkills.filter(id => id !== skillId)
        : [...prev.selectedSkills, skillId]
    }));
  };
  
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };
  
  const handleAddVideo = () => {
    setVideos(prev => [...prev, {
      id: Date.now(),
      title: '',
      file: null,
      order: prev.length + 1,
      duration: 0,
      enableDubbing: false,
      urduScript: '',
      uploading: false,
      dubbingInProgress: false
    }]);
  };
  
  const handleVideoChange = (videoId, field, value) => {
    setVideos(prev => prev.map(video =>
      video.id === videoId ? { ...video, [field]: value } : video
    ));
  };
  
  const handleVideoFileChange = (videoId, file) => {
    setVideos(prev => prev.map(video =>
      video.id === videoId ? { ...video, file } : video
    ));
  };
  
  const handleRemoveVideo = (videoId) => {
    setVideos(prev => prev.filter(video => video.id !== videoId));
  };
  
  const handleAddDocument = () => {
    setDocuments(prev => [...prev, {
      id: Date.now(),
      title: '',
      file: null,
      order: prev.length + 1,
      fileType: 'pdf'
    }]);
  };
  
  const handleDocumentChange = (docId, field, value) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, [field]: value } : doc
    ));
  };
  
  const handleDocumentFileChange = (docId, file) => {
    const fileType = file.name.split('.').pop().toLowerCase();
    setDocuments(prev => prev.map(doc =>
      doc.id === docId ? { ...doc, file, fileType } : doc
    ));
  };
  
  const handleRemoveDocument = (docId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };
  
  // Upload via backend for large files (uses API key, higher limits)
  const uploadViaBackend = async (file, resourceType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resourceType', resourceType);
    
    console.log('� Uploading via backend:', {
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      resourceType
    });
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/upload/course-media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Backend upload failed:', errorData);
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Upload successful:', result.data.url);
      
      return result.data;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  };
  
  const uploadToCloudinary = async (file, resourceType = 'image') => {
    // Use backend upload for videos (higher limits with API key)
    if (resourceType === 'video') {
      return uploadViaBackend(file, 'video');
    }
    
    // Use backend for large files (> 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return uploadViaBackend(file, resourceType);
    }
    
    // Direct upload for small files
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'skill_trade');
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in your .env file');
    }
    
    const uploadResourceType = resourceType === 'raw' ? 'raw' : 'auto';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${uploadResourceType}/upload`;
    
    console.log('📤 Uploading to Cloudinary:', {
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      resourceType: uploadResourceType,
    });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Cloudinary upload failed:', errorData);
        throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Upload successful:', data.secure_url);
      
      return {
        url: data.secure_url,
        publicId: data.public_id,
        duration: data.duration || 0
      };
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      showError('Please enter a course title');
      return;
    }
    
    if (formData.description.trim().length < 50) {
      showError('Description must be at least 50 characters');
      return;
    }
    
    if (formData.selectedSkills.length === 0) {
      showError('Please select at least one skill from the skills section below');
      // Scroll to skills section
      document.querySelector('.skills-grid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (!formData.category) {
      showError('Please select a category');
      return;
    }
    
    if (!formData.level) {
      showError('Please select a level');
      return;
    }
    
    setLoading(true);
    setUploading(true);
    
    try {
      // Upload thumbnail
      let thumbnailData = null;
      if (thumbnail) {
        showInfo('Uploading thumbnail...');
        thumbnailData = await uploadToCloudinary(thumbnail, 'image');
      }
      
      // Upload videos
      const uploadedVideos = [];
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (video.file) {
          showInfo(`Uploading video ${i + 1}/${videos.length}...`);
          const videoData = await uploadToCloudinary(video.file, 'video');
          uploadedVideos.push({
            title: video.title,
            url: videoData.url,
            publicId: videoData.publicId,
            duration: videoData.duration,
            order: video.order
          });
        }
      }
      
      // Upload documents
      const uploadedDocuments = [];
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        if (doc.file) {
          showInfo(`Uploading document ${i + 1}/${documents.length}...`);
          const docData = await uploadToCloudinary(doc.file, 'raw');
          uploadedDocuments.push({
            title: doc.title,
            url: docData.url,
            publicId: docData.publicId,
            fileType: doc.fileType,
            fileSize: doc.file.size,
            order: doc.order
          });
        }
      }
      
      // Create course
      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level.toLowerCase().replace(' levels', '').replace(' ', ''), // Convert to lowercase: 'beginner', 'intermediate', 'advanced', 'all'
        price: Number(formData.price),
        coinsRequired: Number(formData.coinsRequired),
        skills: formData.selectedSkills,
        thumbnail: thumbnailData,
        videos: uploadedVideos,
        documents: uploadedDocuments,
        isPublished: publishNow,
        isDraft: !publishNow
      };
      
      const createdCourse = await createCourse(courseData);
      
      // Generate Urdu dubbing for videos that have it enabled
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (video.enableDubbing && video.urduScript.trim() && uploadedVideos[i]) {
          try {
            showInfo(`Generating Urdu dubbing for video ${i + 1}...`);
            const videoId = createdCourse.videos[i]._id;
            await generateUrduDubbing(createdCourse._id, videoId, video.urduScript);
          } catch (error) {
            console.error('Error generating dubbing:', error);
            showError(`Failed to generate dubbing for video ${i + 1}`);
          }
        }
      }
      
      showSuccess(
        publishNow 
          ? 'Course created and published successfully!' 
          : 'Course saved as draft!'
      );
      navigate('/courses/my');
      
    } catch (error) {
      console.error('Error creating course:', error);
      showError(error.message || 'Failed to create course');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };
  
  return (
    <div className="create-course-page">
      <div className="create-course-container">
        <div className="page-header">
          <h1>Create New Course</h1>
          <p>Share your knowledge with the SkillTrade community</p>
        </div>
        
        <form onSubmit={(e) => handleSubmit(e, false)} className="course-form">
          {/* Basic Information */}
          <section className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Complete Web Development Bootcamp"
                maxLength={200}
                required
              />
              <span className="char-count">{formData.title.length}/200</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what students will learn in this course..."
                rows={6}
                maxLength={2000}
                required
              />
              <span className="char-count">{formData.description.length}/2000 (min 50)</span>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="level">Level *</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select level</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (Optional)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="coinsRequired">Coins Required *</label>
                <input
                  type="number"
                  id="coinsRequired"
                  name="coinsRequired"
                  value={formData.coinsRequired}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="thumbnail">Course Thumbnail</label>
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview && (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Thumbnail preview" />
                </div>
              )}
            </div>
          </section>
          
          {/* Skills */}
          <section className="form-section">
            <h2>Related Skills *</h2>
            <p className="section-description">
              {skills.length > 0 
                ? `Select the skills covered in this course (${formData.selectedSkills.length} selected)`
                : 'Loading skills...'}
            </p>
            
            {skills.length === 0 ? (
              <div className="empty-state">
                <p><Hourglass size={16} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'6px'}} /> Loading skills from database...</p>
                <p className="hint">If skills don't load, please check your internet connection or refresh the page.</p>
              </div>
            ) : (
              <div className="skills-grid">
                {skills.map(skill => (
                  <div
                    key={skill._id}
                    className={`skill-chip ${formData.selectedSkills.includes(skill._id) ? 'selected' : ''}`}
                    onClick={() => handleSkillToggle(skill._id)}
                  >
                    {skill.name}
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {/* Videos */}
          <section className="form-section">
            <h2>Course Videos</h2>
            <p className="section-description">Upload video lessons for your course</p>
            
            {videos.map((video, index) => (
              <div key={video.id} className="media-item">
                <div className="media-header">
                  <h3>Video {index + 1}</h3>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveVideo(video.id)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="form-group">
                  <label>Video Title</label>
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => handleVideoChange(video.id, 'title', e.target.value)}
                    placeholder="e.g., Introduction to React"
                  />
                </div>
                
                <div className="form-group">
                  <label>Video File</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoFileChange(video.id, e.target.files[0])}
                  />
                  {video.file && (
                    <span className="file-name"><Video size={16} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}} /> {video.file.name}</span>
                  )}
                </div>
                
                {/* Urdu Dubbing */}
                <div className="dubbing-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={video.enableDubbing}
                      onChange={(e) => handleVideoChange(video.id, 'enableDubbing', e.target.checked)}
                    />
                    <span>Add Urdu dubbing for this video</span>
                  </label>
                  
                  {video.enableDubbing && (
                    <div className="form-group">
                      <label>Urdu Script</label>
                      <textarea
                        value={video.urduScript}
                        onChange={(e) => handleVideoChange(video.id, 'urduScript', e.target.value)}
                        placeholder="Enter the Urdu text to be dubbed..."
                        rows={4}
                      />
                      <small><Lightbulb size={14} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}} /> The script will be converted to speech using AI after course creation</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="btn-add"
              onClick={handleAddVideo}
            >
              + Add Video
            </button>
          </section>
          
          {/* Documents */}
          <section className="form-section">
            <h2>Course Documents</h2>
            <p className="section-description">Upload supplementary materials (PDFs, slides, etc.)</p>
            
            {documents.map((doc, index) => (
              <div key={doc.id} className="media-item">
                <div className="media-header">
                  <h3>Document {index + 1}</h3>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveDocument(doc.id)}
                  >
                    ✕
                  </button>
                </div>
                
                <div className="form-group">
                  <label>Document Title</label>
                  <input
                    type="text"
                    value={doc.title}
                    onChange={(e) => handleDocumentChange(doc.id, 'title', e.target.value)}
                    placeholder="e.g., Course Slides"
                  />
                </div>
                
                <div className="form-group">
                  <label>Document File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={(e) => handleDocumentFileChange(doc.id, e.target.files[0])}
                  />
                  {doc.file && (
                    <span className="file-name"><FileText size={16} aria-hidden="true" style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}} /> {doc.file.name}</span>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              className="btn-add"
              onClick={handleAddDocument}
            >
              + Add Document
            </button>
          </section>
          
          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            
            <button
              type="button"
              className="btn-success"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Course'}
            </button>
            
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/courses/my')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
          
          {uploading && (
            <div className="upload-progress">
              <div className="spinner"></div>
              <p>Uploading files... Please don't close this page.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
