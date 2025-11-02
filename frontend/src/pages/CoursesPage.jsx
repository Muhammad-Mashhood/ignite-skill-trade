import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { getCourses, getSkills } from '../services/api';
import './CoursesPage.css';

const CoursesPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  
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
    fetchCourses();
  }, [searchTerm, selectedCategory, selectedLevel, sortBy]);
  
  const fetchSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm,
        category: selectedCategory,
        level: selectedLevel,
        sort: sortBy,
      };
      const data = await getCourses(filters);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };
  
  const filteredCourses = selectedSkills.length > 0
    ? courses.filter(course =>
        course.skills?.some(skill =>
          selectedSkills.includes(typeof skill === 'object' ? skill._id : skill)
        )
      )
    : courses;
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedSkills([]);
    setSortBy('newest');
  };
  
  if (loading) {
    return (
      <div className="courses-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="courses-page">
      <div className="courses-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Browse Courses</h1>
            <p>Discover courses from skilled instructors in the community</p>
          </div>
        </div>
        
        <div className="courses-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filters</h3>
              {(searchTerm || selectedCategory || selectedLevel || selectedSkills.length > 0) && (
                <button className="btn-clear-filters" onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>
            
            {/* Category Filter */}
            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                {categories.map(category => (
                  <label key={category} className="filter-checkbox">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(
                        selectedCategory === category ? '' : category
                      )}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Level Filter */}
            <div className="filter-group">
              <h4>Level</h4>
              <div className="filter-options">
                {levels.map(level => (
                  <label key={level} className="filter-checkbox">
                    <input
                      type="radio"
                      name="level"
                      checked={selectedLevel === level}
                      onChange={() => setSelectedLevel(
                        selectedLevel === level ? '' : level
                      )}
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Skills Filter */}
            <div className="filter-group">
              <h4>Skills</h4>
              <div className="filter-options skills-filter">
                {skills.slice(0, 10).map(skill => (
                  <label key={skill._id} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill._id)}
                      onChange={() => handleSkillToggle(skill._id)}
                    />
                    <span>{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="courses-main">
            {/* Search and Sort */}
            <div className="search-sort-bar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search courses..."
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
              
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            
            {/* Results Count */}
            <div className="results-count">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </div>
            
            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="courses-grid">
                {filteredCourses.map(course => (
                  <div
                    key={course._id}
                    className="course-card"
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    <div
                      className="course-thumbnail"
                      style={{
                        backgroundImage: course.thumbnail?.url
                          ? `url(${course.thumbnail.url})`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      {course.hasAccess === false && (
                        <span className="lock-badge">🔒</span>
                      )}
                    </div>
                    
                    <div className="course-body">
                      <div className="instructor-badge">
                        <img
                          src={course.instructor?.avatar || '/default-avatar.png'}
                          alt={course.instructor?.name}
                          className="instructor-avatar-small"
                        />
                        <span>{course.instructor?.name || 'Unknown'}</span>
                      </div>
                      
                      <h3 className="course-title">{course.title}</h3>
                      
                      <div className="course-meta">
                        <span className="category">{course.category}</span>
                        <span className="level">{course.level}</span>
                      </div>
                      
                      <div className="course-stats-row">
                        <span className="stat">
                          ⭐ {course.stats?.averageRating?.toFixed(1) || '0.0'}
                        </span>
                        <span className="stat">
                          👥 {course.stats?.enrollmentCount || 0}
                        </span>
                        <span className="stat">
                          👁️ {course.stats?.views || 0}
                        </span>
                      </div>
                      
                      <div className="course-footer">
                        <span className="price">💰 {course.coinsRequired} Coins</span>
                        {course.hasAccess === false && (
                          <span className="locked-label">Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h2>No courses found</h2>
                <p>Try adjusting your search or filters</p>
                <button className="btn-clear-filters" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
