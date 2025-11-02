import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { getMyCourses, deleteCourse, publishCourse } from '../services/api';
import './MyCoursesPage.css';

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft
  
  useEffect(() => {
    fetchMyCourses();
  }, []);
  
  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const data = await getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCourse(courseId);
      showToast('Course deleted successfully', 'success');
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast(error.message || 'Failed to delete course', 'error');
    }
  };
  
  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await publishCourse(courseId);
      showToast(
        currentStatus ? 'Course unpublished' : 'Course published successfully!',
        'success'
      );
      fetchMyCourses();
    } catch (error) {
      console.error('Error toggling publish:', error);
      showToast(error.message || 'Failed to update course status', 'error');
    }
  };
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'published' && course.isPublished) ||
      (filterStatus === 'draft' && course.isDraft);
    return matchesSearch && matchesStatus;
  });
  
  const totalEnrollments = courses.reduce((sum, course) => sum + (course.stats?.enrollmentCount || 0), 0);
  const avgRating = courses.length > 0
    ? (courses.reduce((sum, course) => sum + (course.stats?.averageRating || 0), 0) / courses.length).toFixed(1)
    : '0.0';
  
  if (loading) {
    return (
      <div className="my-courses-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your courses...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-courses-page">
      <div className="my-courses-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>My Courses</h1>
            <p>Manage your course content and track performance</p>
          </div>
          <button
            className="btn-create"
            onClick={() => navigate('/courses/create')}
          >
            + Create Course
          </button>
        </div>
        
        {/* Stats Cards */}
        {courses.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <h3>{courses.length}</h3>
                <p>Total Courses</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{totalEnrollments}</h3>
                <p>Total Enrollments</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>{avgRating}</h3>
                <p>Average Rating</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">👁️</div>
              <div className="stat-info">
                <h3>{courses.reduce((sum, c) => sum + (c.stats?.views || 0), 0)}</h3>
                <p>Total Views</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        {courses.length > 0 && (
          <div className="filters-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="status-filters">
              <button
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({courses.length})
              </button>
              <button
                className={`filter-btn ${filterStatus === 'published' ? 'active' : ''}`}
                onClick={() => setFilterStatus('published')}
              >
                Published ({courses.filter(c => c.isPublished).length})
              </button>
              <button
                className={`filter-btn ${filterStatus === 'draft' ? 'active' : ''}`}
                onClick={() => setFilterStatus('draft')}
              >
                Drafts ({courses.filter(c => c.isDraft).length})
              </button>
            </div>
          </div>
        )}
        
        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <div key={course._id} className="course-card">
                <div
                  className="course-thumbnail"
                  onClick={() => navigate(`/courses/${course._id}`)}
                  style={{
                    backgroundImage: course.thumbnail?.url
                      ? `url(${course.thumbnail.url})`
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <span className={`status-badge ${course.isPublished ? 'published' : 'draft'}`}>
                    {course.isPublished ? '✓ Published' : '📝 Draft'}
                  </span>
                </div>
                
                <div className="course-content">
                  <h3
                    className="course-title"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    {course.title}
                  </h3>
                  
                  <div className="course-meta">
                    <span className="category-badge">{course.category}</span>
                    <span className="level-badge">{course.level}</span>
                  </div>
                  
                  <div className="course-stats">
                    <div className="stat-item">
                      <span className="icon">👁️</span>
                      <span>{course.stats?.views || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="icon">👥</span>
                      <span>{course.stats?.enrollmentCount || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="icon">⭐</span>
                      <span>{course.stats?.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="icon">💬</span>
                      <span>{course.stats?.ratingCount || 0}</span>
                    </div>
                  </div>
                  
                  <div className="course-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => navigate(`/courses/${course._id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn-action ${course.isPublished ? 'btn-unpublish' : 'btn-publish'}`}
                      onClick={() => handleTogglePublish(course._id, course.isPublished)}
                    >
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(course._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {searchTerm || filterStatus !== 'all' ? (
              <>
                <div className="empty-icon">🔍</div>
                <h2>No courses found</h2>
                <p>Try adjusting your search or filters</p>
                <button
                  className="btn-reset"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">📚</div>
                <h2>No courses yet</h2>
                <p>Start sharing your knowledge by creating your first course</p>
                <button
                  className="btn-create-large"
                  onClick={() => navigate('/courses/create')}
                >
                  Create Your First Course
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
