import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyPosts, deletePost } from '../services/api';
import PostCard from '../components/posts/PostCard';
import './PostsPage.css';

const MyPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPosts();
  }, [filter]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (filter !== 'all') {
        filters.type = filter;
      }
      
      console.log('=== FETCHING MY POSTS ===');
      console.log('User:', user);
      console.log('Token exists:', !!localStorage.getItem('token'));
      console.log('Filters:', filters);
      
      const data = await getMyPosts(filters);
      
      console.log('Raw response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      console.log('Has data property?', !!data.data);
      
      const postsArray = Array.isArray(data) ? data : (data.data || []);
      console.log('Posts array:', postsArray);
      console.log('Posts count:', postsArray.length);
      
      setPosts(postsArray);
    } catch (err) {
      setError(err.message || 'Failed to load your posts');
      console.error('Error fetching my posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(err.message || 'Failed to delete post');
    }
  };

  const getFilteredPosts = () => {
    return posts;
  };

  const filteredPosts = getFilteredPosts();

  return (
    <div className="posts-page">
      <div className="posts-header">
        <div className="posts-title-section">
          <h1>My Posts</h1>
          <p>Manage your posts and gigs</p>
        </div>
        <button
          className="create-post-btn"
          onClick={() => navigate('/posts/create')}
        >
          <span>➕</span> Create New Post
        </button>
      </div>

      <div className="posts-filters">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Posts ({posts.length})
          </button>
          <button
            className={`filter-tab ${filter === 'offer' ? 'active' : ''}`}
            onClick={() => setFilter('offer')}
          >
            🎓 Teaching ({posts.filter(p => p.type === 'offer').length})
          </button>
          <button
            className={`filter-tab ${filter === 'request' ? 'active' : ''}`}
            onClick={() => setFilter('request')}
          >
            📚 Learning ({posts.filter(p => p.type === 'request').length})
          </button>
          <button
            className={`filter-tab ${filter === 'gig' ? 'active' : ''}`}
            onClick={() => setFilter('gig')}
          >
            💼 Gigs ({posts.filter(p => p.type === 'gig').length})
          </button>
        </div>
      </div>

      {loading && (
        <div className="posts-loading">
          <div className="loading-spinner"></div>
          <p>Loading your posts...</p>
        </div>
      )}

      {error && (
        <div className="posts-error">
          <p>⚠️ {error}</p>
          <button onClick={fetchMyPosts}>Try Again</button>
        </div>
      )}

      {!loading && !error && filteredPosts.length === 0 && (
        <div className="posts-empty">
          <div className="empty-icon">📭</div>
          <h3>No posts yet</h3>
          <p>Create your first post to start sharing your skills!</p>
          <button
            className="create-post-btn-large"
            onClick={() => navigate('/posts/create')}
          >
            Create Your First Post
          </button>
        </div>
      )}

      {!loading && !error && filteredPosts.length > 0 && (
        <div className="posts-grid">
          {filteredPosts.map((post) => {
            if (!post || !post._id) {
              console.warn('Invalid post data:', post);
              return null;
            }
            return (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDeletePost}
                isOwner={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;
