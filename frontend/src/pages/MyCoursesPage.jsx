import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { getMyCourses, deleteCourse, publishCourse } from '../services/api';
import { 
  PlusSquare, 
  Search, 
  BookOpen, 
  Users, 
  Star, 
  Eye, 
  Edit3, 
  Trash2, 
  Globe, 
  Lock,
  BarChart3,
  X,
  Activity,
  ArrowRight
} from 'lucide-react';
import './MyCoursesPage.css';

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  
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
      showToast('Failed to load your courses. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCourse(courseId);
      showToast('Course deleted successfully', 'success');
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast(error.message || 'Deletion failed', 'error');
    }
  };
  
  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await publishCourse(courseId);
      showToast(
        currentStatus ? 'Course unpublished' : 'Course published!',
        'success'
      );
      fetchMyCourses();
    } catch (error) {
      console.error('Error toggling publish:', error);
      showToast(error.message || 'Status update failed', 'error');
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
        <div className="loading-container-nodal">
          <div className="editorial-loader">
            <div className="loader-bar"></div>
            <p className="loader-text">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-courses-page">
      <div className="my-courses-container">
        <header className="courses-hero-nodal">
          <div className="hero-identity-nodal">
            <h1 className="editorial-title-large">My Courses</h1>
            <p className="editorial-subtitle-nodal">Manage your courses and track how they're performing.</p>
          </div>
          <button
            className="btn-primary-nodal"
            onClick={() => navigate('/courses/create')}
          >
            <PlusSquare size={18} />
            <span>New Course</span>
          </button>
        </header>
        
        {courses.length > 0 && (
          <div className="performance-telemetry-grid">
            <div className="telemetry-card-nodal">
              <div className="telemetry-icon-nodal"><BookOpen size={20} /></div>
              <div className="telemetry-data-nodal">
                <span className="telemetry-value-nodal">{courses.length}</span>
                <span className="telemetry-label-nodal">Courses</span>
              </div>
            </div>
            
            <div className="telemetry-card-nodal">
              <div className="telemetry-icon-nodal"><Users size={20} /></div>
              <div className="telemetry-data-nodal">
                <span className="telemetry-value-nodal">{totalEnrollments}</span>
                <span className="telemetry-label-nodal">Total Enrollments</span>
              </div>
            </div>
            
            <div className="telemetry-card-nodal">
              <div className="telemetry-icon-nodal"><Star size={20} /></div>
              <div className="telemetry-data-nodal">
                <span className="telemetry-value-nodal">{avgRating}</span>
                <span className="telemetry-label-nodal">Avg. Rating</span>
              </div>
            </div>
            
            <div className="telemetry-card-nodal">
              <div className="telemetry-icon-nodal"><Activity size={20} /></div>
              <div className="telemetry-data-nodal">
                <span className="telemetry-value-nodal">{courses.reduce((sum, c) => sum + (c.stats?.views || 0), 0)}</span>
                <span className="telemetry-label-nodal">Total Views</span>
              </div>
            </div>
          </div>
        )}
        
        {courses.length > 0 && (
          <div className="registry-controls-nodal">
            <div className="search-input-wrapper-nodal directory">
              <Search size={20} className="search-icon-nodal" />
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="editorial-search-nodal"
              />
              {searchTerm && (
                <button className="search-clear-nodal" onClick={() => setSearchTerm('')}>
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="registry-tabs-nodal">
              <button
                className={`tab-nodal ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({courses.length})
              </button>
              <button
                className={`tab-nodal ${filterStatus === 'published' ? 'active' : ''}`}
                onClick={() => setFilterStatus('published')}
              >
                Published ({courses.filter(c => c.isPublished).length})
              </button>
              <button
                className={`tab-nodal ${filterStatus === 'draft' ? 'active' : ''}`}
                onClick={() => setFilterStatus('draft')}
              >
                Drafts ({courses.filter(c => c.isDraft).length})
              </button>
            </div>
          </div>
        )}
        
        {filteredCourses.length > 0 ? (
          <div className="curriculum-grid-editorial">
            {filteredCourses.map(course => (
              <div key={course._id} className="nodal-curriculum-card">
                <div
                  className="course-thumbnail-nodal"
                  onClick={() => navigate(`/courses/${course._id}`)}
                  style={{
                    backgroundImage: course.thumbnail?.url
                      ? `url(${course.thumbnail.url})`
                      : 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)'
                  }}
                >
                  <div className={`status-ribbon-nodal ${course.isPublished ? 'published' : 'draft'}`}>
                    <span>{course.isPublished ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
                
                <div className="course-content-nodal">
                  <div className="course-header-nodal">
                    <span className="course-type-tag">{course.category.toUpperCase()}</span>
                    <span className="course-id-tag">ID_{course._id.substring(0, 6).toUpperCase()}</span>
                  </div>
                  
                  <h3
                    className="course-title-nodal"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    {course.title}
                  </h3>
                  
                  <div className="course-telemetry-nodal">
                    <div className="telemetry-bit">
                      <Eye size={12} />
                      <span>{course.stats?.views || 0}</span>
                    </div>
                    <div className="telemetry-bit">
                      <Users size={12} />
                      <span>{course.stats?.enrollmentCount || 0}</span>
                    </div>
                    <div className="telemetry-bit">
                      <Star size={12} fill="var(--accent)" stroke="var(--accent)" />
                      <span>{course.stats?.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                  
                  <div className="course-actions-nodal">
                    <button
                      className="btn-nodal-icon view"
                      onClick={() => navigate(`/courses/${course._id}`)}
                      title="View Course"
                    >
                      <ArrowRight size={14} />
                    </button>
                    <button
                      className="btn-nodal-icon edit"
                      onClick={() => navigate(`/courses/${course._id}/edit`)}
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      className={`btn-nodal-icon ${course.isPublished ? 'unpublish' : 'publish'}`}
                      onClick={() => handleTogglePublish(course._id, course.isPublished)}
                      title={course.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {course.isPublished ? <Lock size={14} /> : <Globe size={14} />}
                    </button>
                    <button
                      className="btn-nodal-icon delete"
                      onClick={() => handleDelete(course._id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-registry-state directory">
            <BookOpen size={64} strokeWidth={1} />
            <h2>No courses yet</h2>
            <p>You haven't created any courses yet.</p>
            <button
              className="btn-primary-nodal"
              onClick={() => navigate('/courses/create')}
            >
              Create Your First Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
