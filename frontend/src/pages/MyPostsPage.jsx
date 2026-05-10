import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusSquare, 
  AlertCircle, 
  Inbox, 
  ArrowRight,
  Radio,
  Zap,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMyPosts, deletePost } from '../services/api';
import PostCard from '../components/posts/PostCard';
import './PostsPage.css'; // Reusing global directory styles for consistency

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
      
      const data = await getMyPosts(filters);
      const postsArray = Array.isArray(data) ? data : (data.data || []);
      setPosts(postsArray);
    } catch (err) {
      setError(err.message || 'Failed to load your posts. Please try again.');
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
    }
  };

  return (
    <div className="posts-page">
      <div className="posts-container">
        <header className="posts-hero-editorial">
          <div className="hero-identity-nodal">
            <h1 className="editorial-title-large">My Posts</h1>
            <p className="editorial-subtitle-nodal">Manage your skill exchange posts and proposals.</p>
          </div>
          <button
            className="btn-primary-nodal"
            onClick={() => navigate('/posts/create')}
          >
            <PlusSquare size={18} />
            <span>New Post</span>
          </button>
        </header>

        <section className="registry-tabs-nodal">
          <button
            className={`tab-nodal ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <Radio size={14} />
            <span>All ({posts.length})</span>
          </button>
          <button
            className={`tab-nodal ${filter === 'offer' ? 'active' : ''}`}
            onClick={() => setFilter('offer')}
          >
            <Zap size={14} />
            <span>Teaching ({posts.filter(p => p.type === 'offer').length})</span>
          </button>
          <button
            className={`tab-nodal ${filter === 'request' ? 'active' : ''}`}
            onClick={() => setFilter('request')}
          >
            <BookOpen size={14} />
            <span>Learning ({posts.filter(p => p.type === 'request').length})</span>
          </button>
          <button
            className={`tab-nodal ${filter === 'gig' ? 'active' : ''}`}
            onClick={() => setFilter('gig')}
          >
            <Briefcase size={14} />
            <span>Gigs ({posts.filter(p => p.type === 'gig').length})</span>
          </button>
        </section>

        {loading ? (
          <div className="directory-loading-state">
            <div className="editorial-loader">
              <div className="loader-bar"></div>
              <p className="loader-text">Loading your posts...</p>
            </div>
          </div>
        ) : error ? (
          <div className="system-error-banner">
            <AlertCircle size={20} />
            <div className="error-log-nodal">
              <h3>Failed to Load Posts</h3>
              <p>{error}</p>
            </div>
            <button className="btn-retry-nodal" onClick={fetchMyPosts}>Try Again</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-registry-state directory">
            <Inbox size={64} strokeWidth={1} />
            <h2>No posts yet</h2>
            <p>You haven't created any posts yet.</p>
            <button
              className="btn-primary-nodal"
              onClick={() => navigate('/posts/create')}
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="directory-grid-editorial">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDeletePost}
                isOwner={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostsPage;
