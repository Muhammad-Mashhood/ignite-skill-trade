import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusSquare, 
  Search, 
  AlertCircle, 
  Filter, 
  LayoutGrid, 
  Inbox, 
  ArrowRight,
  TrendingUp,
  X,
  History,
  SortDesc
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPosts, togglePostInterest, deletePost } from '../services/api';
import PostCard from '../components/posts/PostCard';
import './PostsPage.css';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'trade',
    skill: '',
    search: '',
    sort: '-createdAt',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryFilters = { ...filters, type: 'trade' };
      const data = await getPosts(queryFilters);
      
      let postsArray = [];
      if (Array.isArray(data)) {
        postsArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        postsArray = data.data;
      } else if (data && Array.isArray(data.posts)) {
        postsArray = data.posts;
      }
      setPosts(postsArray);
    } catch (err) {
      setError(err.message || 'Failed to load posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = async (postId) => {
    try {
      const response = await togglePostInterest(postId);
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            isInterested: response.isInterested,
            stats: {
              ...post.stats,
              interests: response.interests,
            }
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error toggling interest:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  return (
    <div className="posts-page">
      <div className="posts-container">
        <header className="posts-hero-editorial">
          <div className="hero-identity-nodal">
            <h1 className="editorial-title-large">Browse Posts</h1>
            <p className="editorial-subtitle-nodal">Browse all skill exchange posts from the community.</p>
          </div>
          <button
            className="btn-primary-nodal"
            onClick={() => navigate('/posts/create')}
          >
            <PlusSquare size={18} />
            <span>New Post</span>
          </button>
        </header>

        <section className="directory-controls-nodal">
          <div className="search-registry-nodal directory">
            <div className="search-input-wrapper-nodal">
              <Search size={20} className="search-icon-nodal" />
              <input
                type="text"
                placeholder="Search by skill, topic, or person..."
                value={filters.search}
                onChange={handleSearchChange}
                className="editorial-search-nodal"
              />
              {filters.search && (
                <button className="search-clear-nodal" onClick={() => handleFilterChange('search', '')}>
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="filter-registry-nodal">
            <div className="filter-select-wrapper">
              <SortDesc size={14} className="filter-icon" />
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="editorial-select-nodal"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-views">Most Viewed</option>
                <option value="title">A–Z</option>
              </select>
            </div>
            
            {filters.search && (
              <button 
                className="btn-text-nodal"
                onClick={() => setFilters({ type: 'trade', skill: '', search: '', sort: '-createdAt' })}
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="directory-loading-state">
            <div className="editorial-loader">
              <div className="loader-bar"></div>
              <p className="loader-text">Loading posts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="system-error-banner">
            <AlertCircle size={20} />
            <div className="error-log-nodal">
              <h3>Failed to load posts</h3>
              <p>{error}</p>
            </div>
            <button className="btn-retry-nodal" onClick={fetchPosts}>Try Again</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-registry-state directory">
            <Inbox size={64} strokeWidth={1} />
            <h2>No posts found</h2>
            <p>No posts match your filters. Try adjusting your search.</p>
            <button
              className="btn-primary-nodal"
              onClick={() => navigate('/posts/create')}
            >
              Share a Skill
            </button>
          </div>
        ) : (
          <div className="directory-grid-editorial">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onInterestToggle={handleInterestToggle}
                onDelete={handleDeletePost}
                isOwner={post.user?._id === user?.uid || post.user === user?.uid}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
