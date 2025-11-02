import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPosts, togglePostInterest, deletePost } from '../services/api';
import PostCard from '../components/posts/PostCard';
import './PostsPage.css';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all'
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
  }, [filters, activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching posts with filters:', filters);
      
      // All posts are now trade posts
      const queryFilters = { ...filters, type: 'trade' };
      
      const data = await getPosts(queryFilters);
      console.log('Fetched posts response:', data);
      
      // Handle both array and object response
      let postsArray = [];
      if (Array.isArray(data)) {
        postsArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        postsArray = data.data;
      } else if (data && Array.isArray(data.posts)) {
        postsArray = data.posts;
      } else {
        console.warn('Unexpected data format:', data);
        postsArray = [];
      }
      
      console.log('Processed posts array:', postsArray.length, 'posts');
      setPosts(postsArray);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = async (postId) => {
    try {
      const response = await togglePostInterest(postId);
      console.log('Interest toggle response:', response);
      
      // Update the post in the list with the response data
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            isInterested: response.isInterested,
            stats: {
              ...post.stats,
              interests: response.interests,
            },
            interestedUsers: response.interestedUsers || post.interestedUsers,
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error toggling interest:', err);
      alert(err.message || 'Failed to toggle interest');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(err.message || 'Failed to delete post');
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
      <div className="posts-header">
        <div className="posts-title-section">
          <h1>Trade Skills</h1>
          <p>Exchange skills and learn from each other</p>
        </div>
        <button
          className="create-post-btn"
          onClick={() => navigate('/posts/create')}
        >
          <span>➕</span> Create Post
        </button>
      </div>

      {/* Removed tabs - all posts are trade posts now */}

      <div className="posts-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Search posts..."
            value={filters.search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="filter-select"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-views">Most Viewed</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {filters.search ? (
          <button
            className="clear-filters-btn"
            onClick={() => setFilters({ type: 'trade', skill: '', search: '', sort: '-createdAt' })}
          >
            Clear Filters
          </button>
        ) : null}
      </div>

      {loading && (
        <div className="posts-loading">
          <div className="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      )}

      {error && (
        <div className="posts-error">
          <p>⚠️ {error}</p>
          <button onClick={fetchPosts}>Try Again</button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="posts-empty">
          <div className="empty-icon">📭</div>
          <h3>No posts found</h3>
          <p>Be the first to create a post!</p>
          <button
            className="create-post-btn-large"
            onClick={() => navigate('/posts/create')}
          >
            Create Post
          </button>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="posts-grid">
          {posts.map((post) => {
            if (!post || !post._id) {
              console.warn('Invalid post data:', post);
              return null;
            }
            return (
              <PostCard
                key={post._id}
                post={post}
                onInterestToggle={handleInterestToggle}
                onDelete={handleDeletePost}
                isOwner={post.user?._id === user?.uid || post.user === user?.uid}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
