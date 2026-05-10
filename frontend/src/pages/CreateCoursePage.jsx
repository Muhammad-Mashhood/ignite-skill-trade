import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Video, 
  FileText, 
  Globe, 
  Clock, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  Upload, 
  CheckCircle,
  Info,
  ChevronRight,
  Target
} from 'lucide-react';
import { createCourse, updateCourse, getSkills, generateUrduDubbing } from '../services/api';
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
    'Programming', 'Design', 'Business', 'Marketing', 'Music', 
    'Language', 'Fitness', 'Cooking', 'Photography', 'Other'
  ];
  
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  
  useEffect(() => {
    fetchSkills();
  }, []);
  
  const fetchSkills = async () => {
    try {
      const response = await getSkills();
      if (Array.isArray(response)) {
        setSkills(response);
      } else if (response.data && Array.isArray(response.data)) {
        setSkills(response.data);
      } else if (response.skills && Array.isArray(response.skills)) {
        setSkills(response.skills);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      showError('Failed to load skills. Please refresh.');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
  
  const uploadViaBackend = async (file, resourceType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resourceType', resourceType);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/upload/course-media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Backend upload error:', error);
      throw error;
    }
  };
  
  const uploadToCloudinary = async (file, resourceType = 'image') => {
    if (resourceType === 'video' || file.size > 10 * 1024 * 1024) {
      return uploadViaBackend(file, resourceType === 'video' ? 'video' : 'auto');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'skill_trade');
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error('Cloudinary not configured.');
    
    const uploadResourceType = resourceType === 'raw' ? 'raw' : 'auto';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${uploadResourceType}/upload`;
    
    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Cloudinary upload failed.');
    
    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      duration: data.duration || 0
    };
  };
  
  const handleSubmit = async (e, publishNow = false) => {
    if (e) e.preventDefault();
    
    if (!formData.title.trim()) { showError('Course title required'); return; }
    if (formData.description.trim().length < 50) { showError('Description too short'); return; }
    if (formData.selectedSkills.length === 0) { showError('Select at least one skill'); return; }
    if (!formData.category || !formData.level) { showError('Category and Level required'); return; }
    
    setLoading(true);
    setUploading(true);
    
    try {
      let thumbnailData = null;
      if (thumbnail) {
        showInfo('Uploading thumbnail...');
        thumbnailData = await uploadToCloudinary(thumbnail, 'image');
      }
      
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
      
      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level.toLowerCase().replace(' levels', '').replace(' ', ''),
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
      
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (video.enableDubbing && video.urduScript.trim() && uploadedVideos[i]) {
          try {
            showInfo(`Generating Urdu Signal for Video ${i + 1}...`);
            const videoId = createdCourse.videos[i]._id;
            await generateUrduDubbing(createdCourse._id, videoId, video.urduScript);
          } catch (error) {
            showError(`Failed translation for video ${i + 1}`);
          }
        }
      }
      
      showSuccess(publishNow ? 'Curriculum Initialized' : 'Draft Saved');
      navigate('/courses/my');
    } catch (error) {
      showError(error.message || 'Operation failed');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };
  
  return (
    <div className="create-course-page">
      <div className="create-course-container">
        {/* Editorial Hero */}
        <div className="create-course-hero">
          <div className="hero-nodal-nav">
            <button type="button" className="btn-back-nodal" onClick={() => navigate('/courses/my')}>
              <ArrowLeft size={16} />
              <span>EXIT TO REPOSITORY</span>
            </button>
          </div>
          <div className="hero-editorial-content">
            <div className="editorial-label">CURRICULUM ARCHITECT / INITIALIZATION</div>
            <h1 className="editorial-title">INIT NEW COURSE</h1>
            <p className="editorial-subtitle">Design a structured curriculum for the SkillTrade network.</p>
          </div>
        </div>

        {uploading && (
          <div className="editorial-upload-overlay">
            <div className="upload-nodal-box">
              <div className="nodal-loader"></div>
              <span className="nodal-loader-text">SYNCHRONIZING ASSETS TO NETWORK...</span>
              <p className="nodal-loader-sub">TRANSMITTING MEDIA PACKETS. DO NOT INTERRUPT SIGNAL.</p>
            </div>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="create-course-ledger">
          {/* Section 1: Foundation */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">01</div>
              <h2 className="section-title">FOUNDATION</h2>
            </div>
            
            <div className="ledger-grid">
              <div className="form-group full-width">
                <label htmlFor="title">
                  <span className="label-text">CURRICULUM TITLE</span>
                  <span className="label-required">REQUIRED</span>
                </label>
                <div className="input-nodal-wrapper">
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., ADVANCED SYSTEM ARCHITECTURE"
                    maxLength={200}
                    required
                    className="input-nodal"
                  />
                  <div className="input-character-status">{formData.title.length}/200</div>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  <span className="label-text">CURRICULUM SPECIFICATION</span>
                  <span className="label-required">REQUIRED</span>
                </label>
                <div className="input-nodal-wrapper">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Outline the core learning path and objectives..."
                    rows={6}
                    maxLength={2000}
                    required
                    className="textarea-nodal"
                  />
                  <div className="input-character-status">{formData.description.length}/2000</div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  <span className="label-text">DOMAIN CLASSIFICATION</span>
                </label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} required className="select-nodal">
                  <option value="">SELECT DOMAIN...</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="level">
                  <span className="label-text">TARGET MASTERY</span>
                </label>
                <select id="level" name="level" value={formData.level} onChange={handleInputChange} required className="select-nodal">
                  <option value="">SELECT LEVEL...</option>
                  {levels.map(level => <option key={level} value={level}>{level.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="price">
                  <span className="label-text">CURRENCY VALUE (OPTIONAL)</span>
                </label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} min="0" placeholder="0" className="input-nodal" />
              </div>

              <div className="form-group">
                <label htmlFor="coinsRequired">
                  <span className="label-text">NETWORK COINS REQUIRED</span>
                </label>
                <input type="number" id="coinsRequired" name="coinsRequired" value={formData.coinsRequired} onChange={handleInputChange} min="0" required className="input-nodal" />
              </div>

              <div className="form-group full-width">
                <label>
                  <span className="label-text">VISUAL IDENTITY / THUMBNAIL</span>
                </label>
                <div className="file-nodal-upload">
                  <input type="file" id="thumbnail" accept="image/*" onChange={handleThumbnailChange} className="hidden-input" />
                  <label htmlFor="thumbnail" className="btn-upload-nodal">
                    <Upload size={18} />
                    <span>UPLOAD CURRICULUM VISUAL</span>
                  </label>
                  {thumbnailPreview && (
                    <div className="thumbnail-preview-nodal fadeIn">
                      <img src={thumbnailPreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Skill Nodes */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">02</div>
              <h2 className="section-title">SKILL NODES</h2>
            </div>
            
            <p className="ledger-desc">Map the curriculum to existing network skill nodes.</p>
            
            {skills.length === 0 ? (
              <div className="nodal-empty-strip">
                <div className="mini-loader"></div>
                <span>Loading categories...</span>
              </div>
            ) : (
              <div className="skills-nodal-selector">
                {skills.map(skill => (
                  <div
                    key={skill._id}
                    className={`skill-chip-nodal ${formData.selectedSkills.includes(skill._id) ? 'active' : ''}`}
                    onClick={() => handleSkillToggle(skill._id)}
                  >
                    <div className="chip-indicator"></div>
                    <span>{skill.name.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Signal Streams (Videos) */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">03</div>
              <h2 className="section-title">SIGNAL STREAMS</h2>
              <button type="button" onClick={handleAddVideo} className="btn-add-asset-nodal">
                <Plus size={14} />
                <span>ADD STREAM</span>
              </button>
            </div>

            <div className="asset-ledger-grid">
              {videos.map((video, index) => (
                <div key={video.id} className="asset-nodal-card video">
                  <div className="asset-card-header">
                    <div className="asset-identity">
                      <Video size={14} />
                      <span>STREAM_{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <button type="button" className="btn-remove-asset" onClick={() => handleRemoveVideo(video.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="asset-card-form">
                    <div className="form-group">
                      <label className="label-minimal">STREAM IDENTIFIER</label>
                      <input
                        type="text"
                        value={video.title}
                        onChange={(e) => handleVideoChange(video.id, 'title', e.target.value)}
                        placeholder="e.g., ARCHITECTURE OVERVIEW"
                        className="input-minimal"
                      />
                    </div>

                    <div className="form-group">
                      <label className="label-minimal">MEDIA SOURCE</label>
                      <div className="file-minimal-upload">
                        <input type="file" accept="video/*" id={`video-${video.id}`} onChange={(e) => handleVideoFileChange(video.id, e.target.files[0])} className="hidden-input" />
                        <label htmlFor={`video-${video.id}`} className="btn-minimal-upload">
                          <Upload size={14} />
                          <span>{video.file ? video.file.name : 'SELECT VIDEO SOURCE'}</span>
                        </label>
                      </div>
                    </div>

                    <div className="signal-translation-nodal">
                      <label className="checkbox-nodal">
                        <input
                          type="checkbox"
                          checked={video.enableDubbing}
                          onChange={(e) => handleVideoChange(video.id, 'enableDubbing', e.target.checked)}
                        />
                        <div className="custom-checkbox"></div>
                        <span className="checkbox-text">ENABLE URDU SIGNAL TRANSLATION</span>
                      </label>
                      
                      {video.enableDubbing && (
                        <div className="translation-ledger fadeIn">
                          <label className="label-minimal">TRANSLATION SCRIPT</label>
                          <textarea
                            value={video.urduScript}
                            onChange={(e) => handleVideoChange(video.id, 'urduScript', e.target.value)}
                            placeholder="Input script for signal translation..."
                            rows={4}
                            className="textarea-minimal"
                          />
                          <div className="translation-info">
                            <Globe size={12} />
                            <span>AI-POWERED PHONETIC SYNTHESIS WILL BE APPLIED UPON INITIALIZATION.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Data Assets (Documents) */}
          <div className="ledger-section">
            <div className="section-header">
              <div className="section-number">04</div>
              <h2 className="section-title">DATA ASSETS</h2>
              <button type="button" onClick={handleAddDocument} className="btn-add-asset-nodal">
                <Plus size={14} />
                <span>ADD ASSET</span>
              </button>
            </div>

            <div className="asset-ledger-grid">
              {documents.map((doc, index) => (
                <div key={doc.id} className="asset-nodal-card doc">
                  <div className="asset-card-header">
                    <div className="asset-identity">
                      <FileText size={14} />
                      <span>DATA_{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <button type="button" className="btn-remove-asset" onClick={() => handleRemoveDocument(doc.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="asset-card-form">
                    <div className="form-group">
                      <label className="label-minimal">ASSET IDENTIFIER</label>
                      <input
                        type="text"
                        value={doc.title}
                        onChange={(e) => handleDocumentChange(doc.id, 'title', e.target.value)}
                        placeholder="e.g., TECHNICAL SPECS PDF"
                        className="input-minimal"
                      />
                    </div>

                    <div className="form-group">
                      <label className="label-minimal">SOURCE FILE</label>
                      <div className="file-minimal-upload">
                        <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" id={`doc-${doc.id}`} onChange={(e) => handleDocumentFileChange(doc.id, e.target.files[0])} className="hidden-input" />
                        <label htmlFor={`doc-${doc.id}`} className="btn-minimal-upload">
                          <Upload size={14} />
                          <span>{doc.file ? doc.file.name : 'SELECT DOCUMENT SOURCE'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Initialization */}
          <div className="ledger-actions">
            <button type="button" onClick={() => navigate('/courses/my')} className="btn-cancel-nodal" disabled={loading}>
              TERMINATE
            </button>
            <button type="button" onClick={(e) => handleSubmit(e, false)} className="btn-draft-nodal" disabled={loading}>
              SAVE AS DRAFT
            </button>
            <button type="button" onClick={(e) => handleSubmit(e, true)} className="btn-publish-nodal" disabled={loading}>
              {loading ? (
                <div className="btn-loading-state">
                  <div className="mini-loader"></div>
                  <span>TRANSMITTING...</span>
                </div>
              ) : (
                <div className="btn-ready-state">
                  <Sparkles size={16} />
                  <span>Publish Course</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCoursePage;
