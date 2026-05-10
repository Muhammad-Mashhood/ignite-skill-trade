import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Lock, 
  Star, 
  Users, 
  Eye, 
  Zap, 
  X, 
  ChevronRight,
  BookOpen,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { getCourses, getSkills } from '../services/api';
import './CoursesPage.css';

const CoursesPage = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  
  const [courses, setCourses] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  
  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 'Music', 
    'Language', 'Fitness', 'Cooking', 'Photography', 'Other'
  ];
  
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  
  useEffect(() => {
    fetchSkills();
    fetchCourses();
  }, [searchTerm, selectedCategory, selectedLevel, sortBy]);
  
  const fetchSkills = async () => {
    try {
      const data = await getSkills();
      setSkills(Array.isArray(data) ? data : []);
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
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showError('Failed to load courses');
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
      <div className="courses-loading-container">
        <div className="editorial-loader">
          <div className="loader-bar"></div>
          <span className="loader-text">Loading courses...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="courses-page">
      <header className="courses-hero">
        <div className="hero-branding">
          <span className="registry-tag">Course Catalog</span>
          <h1 className="hero-title-nodal">Curriculum Discovery</h1>
          <p className="hero-subtitle-editorial">Access validated knowledge modules from the global contributor network.</p>
        </div>
        <div className="discovery-stats">
          <div className="stat-nodal">
            <span className="stat-value">{courses.length}</span>
            <span className="stat-label">MODULES</span>
          </div>
          <div className="stat-nodal">
            <span className="stat-value">{categories.length}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </header>

      <div className="discovery-layout">
        <aside className="filters-nodal-sidebar">
          <div className="filters-header-nodal">
            <SlidersHorizontal size={14} />
            <h3>FILTERS</h3>
            {(searchTerm || selectedCategory || selectedLevel || selectedSkills.length > 0) && (
              <button className="btn-clear-nodal" onClick={clearFilters}>
                <X size={10} /> RESET
              </button>
            )}
          </div>
          
          <div className="filter-group-nodal">
            <h4 className="filter-label">CATEGORY</h4>
            <div className="filter-options-nodal">
              {categories.map(category => (
                <button 
                  key={category} 
                  className={`filter-option-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-group-nodal">
            <h4 className="filter-label">LEVEL</h4>
            <div className="filter-options-nodal">
              {levels.map(level => (
                <button 
                  key={level} 
                  className={`filter-option-btn ${selectedLevel === level ? 'active' : ''}`}
                  onClick={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          {skills.length > 0 && (
            <div className="filter-group-nodal">
              <h4 className="filter-label">SKILLS</h4>
              <div className="filter-options-nodal scrollable">
                {skills.slice(0, 15).map(skill => (
                  <label key={skill._id} className="filter-checkbox-nodal">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill._id)}
                      onChange={() => handleSkillToggle(skill._id)}
                    />
                    <span className="checkbox-box"></span>
                    <span className="checkbox-label">{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>
        
        <main className="discovery-main">
          <div className="control-bar-nodal">
            <div className="search-cluster-nodal">
              <Search size={16} className="search-icon-nodal" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="registry-search-input"
              />
              {searchTerm && (
                <button className="btn-search-clear" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>
            
            <div className="sort-cluster-nodal">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="registry-sort-select"
              >
                <option value="newest">NEWEST EMISSIONS</option>
                <option value="popular">MAX AUDIENCE</option>
                <option value="rating">PEER REPUTATION</option>
              </select>
            </div>
          </div>
          
          <div className="results-metrics-nodal">
            <LayoutGrid size={12} />
            <span>{filteredCourses.length} MODULES DETECTED</span>
          </div>
          
          {filteredCourses.length > 0 ? (
            <div className="registry-grid-nodal">
              {filteredCourses.map(course => (
                <article 
                  key={course._id} 
                  className="course-nodal-card"
                  onClick={() => navigate(`/courses/${course._id}`)}
                >
                  <div className="card-media-nodal">
                    {course.thumbnail?.url ? (
                      <img src={course.thumbnail.url} alt={course.title} />
                    ) : (
                      <div className="media-placeholder-nodal">
                        <BookOpen size={48} strokeWidth={1} />
                      </div>
                    )}
                    {course.hasAccess === false && (
                      <div className="lock-overlay-nodal">
                        <Lock size={20} />
                      </div>
                    )}
                    <div className="category-tag-nodal">{course.category}</div>
                  </div>
                  
                  <div className="card-content-nodal">
                    <div className="instructor-nodal">
                      <img
                        src={course.instructor?.avatar || '/default-avatar.png'}
                        alt={course.instructor?.name}
                      />
                      <span>{course.instructor?.name || 'ANONYMOUS'}</span>
                    </div>
                    
                    <h3 className="course-title-editorial">{course.title}</h3>
                    
                    <div className="course-telemetry-row">
                      <div className="telemetry-item">
                        <Star size={12} className="accent-text" />
                        <span>{course.stats?.averageRating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="telemetry-item">
                        <Users size={12} />
                        <span>{course.stats?.enrollmentCount || 0}</span>
                      </div>
                      <div className="telemetry-item">
                        <Eye size={12} />
                        <span>{course.stats?.views || 0}</span>
                      </div>
                    </div>
                    
                    <div className="card-footer-nodal">
                      <div className="price-nodal">
                        <Zap size={14} fill="var(--accent)" stroke="var(--accent)" />
                        <span>{course.coinsRequired} COINS</span>
                      </div>
                      <div className="view-action-nodal">
                        <span>ACCESS</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-registry-state">
              <Search size={64} strokeWidth={0.5} />
              <h2>NO MODULES DETECTED</h2>
              <p>The specified parameters yielded zero results in the current registry.</p>
              <button className="btn-primary-nodal" onClick={clearFilters}>
                RESET PARAMETERS
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CoursesPage;
