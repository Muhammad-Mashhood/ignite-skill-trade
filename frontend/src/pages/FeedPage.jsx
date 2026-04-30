import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPersonalizedFeed, getTrendingPosts, togglePostInterest } from '../services/api';
import PostCard from '../components/posts/PostCard';
import './FeedPage.css';

const FeedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Infinite scroll observer
  const observerRef = useRef();
  const loadMoreRef = useCallback(node => {
    if (loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch personalized feed and trending posts in parallel
      const [feedData, trendingData] = await Promise.all([
        getPersonalizedFeed(1, 30),
        getTrendingPosts(5),
      ]);

      setPosts(feedData.data || feedData);
      setTrendingPosts(trendingData.data || trendingData);
      
      // Set pagination info
      if (feedData.pagination) {
        setHasMore(feedData.pagination.hasMore);
        setTotalPages(feedData.pagination.pages);
      }
    } catch (err) {
      setError(err.message || 'Failed to load feed');
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = posts.filter(post => {
      const titleMatch = post.title?.toLowerCase().includes(searchLower);
      const userMatch = post.user?.name?.toLowerCase().includes(searchLower);
      const willTeachMatch = post.willTeach?.some(wt => 
        wt.skill?.name?.toLowerCase().includes(searchLower)
      );
      const wantLearnMatch = post.wantToLearn?.some(wl => 
        wl.skill?.name?.toLowerCase().includes(searchLower)
      );
      
      return titleMatch || userMatch || willTeachMatch || wantLearnMatch;
    });

    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      
      const feedData = await getPersonalizedFeed(nextPage, 10);
      const newPosts = feedData.data || feedData;

      setPosts(prev => [...prev, ...newPosts]);
      setPage(nextPage);
      
      if (feedData.pagination) {
        setHasMore(feedData.pagination.hasMore);
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleInterestToggle = async (postId) => {
    try {
      const response = await togglePostInterest(postId);
      
      // Update the post in both main feed and trending
      const updatePost = (post) => {
        if (post._id === postId) {
          return {
            ...post,
            isInterested: response.isInterested,
            stats: {
              ...post.stats,
              interests: response.interests,
            },
          };
        }
        return post;
      };

      setPosts(posts.map(updatePost));
      setTrendingPosts(trendingPosts.map(updatePost));
    } catch (err) {
      console.error('Error toggling interest:', err);
    }
  };

  const getMatchBadge = (matchScore) => {
    if (!matchScore || matchScore === 0) return null;
    
    let badgeClass = 'match-low';
    let label = 'Low Match';
    
    if (matchScore >= 70) {
      badgeClass = 'match-high';
      label = 'Perfect Match';
    } else if (matchScore >= 40) {
      badgeClass = 'match-medium';
      label = 'Good Match';
    }

    return (
      <div className={`match-badge ${badgeClass}`}>
        <span className="match-icon">🎯</span>
        <span className="match-text">{label}</span>
        <span className="match-score">{matchScore}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="loading-spinner"></div>
        <p>Loading your personalized feed...</p>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-container">
        {/* Header */}
        <div className="feed-header">
          <div className="feed-title-section">
            <h1>Your Feed</h1>
            <p>Personalized recommendations based on your interests</p>
          </div>
          <button
            className="create-post-btn"
            onClick={() => navigate('/posts/create')}
          >
            <span>➕</span> Create Post
          </button>
        </div>

        {/* Search Bar */}
        <div className="feed-search">
          <input
            type="text"
            placeholder="🔍 Search by title, skills, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
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

        {error && (
          <div className="feed-error">
            <p>⚠️ {error}</p>
            <button onClick={fetchInitialData}>Try Again</button>
          </div>
        )}

        <div className="feed-layout">
          {/* Main Feed */}
          <div className="feed-main">
            {posts.length === 0 ? (
              <div className="feed-empty">
                <div className="empty-icon">📭</div>
                <h3>No posts in your feed yet</h3>
                <p>Start creating posts or browsing to see personalized recommendations!</p>
                <button
                  className="browse-btn"
                  onClick={() => navigate('/posts')}
                >
                  Browse All Posts
                </button>
              </div>
            ) : (
              <>
                <div className="feed-posts">
                  {filteredPosts.map((post, index) => (
                    <div key={post._id || index} className="feed-post-item">
                      {getMatchBadge(post.matchScore)}
                      <PostCard
                        post={post}
                        onInterestToggle={handleInterestToggle}
                        isOwner={post.user?._id === user?.uid}
                      />
                    </div>
                  ))}
                </div>

                {searchTerm && filteredPosts.length === 0 && (
                  <div className="no-results">
                    <p className="empty-icon">🔍</p>
                    <h3>No posts found</h3>
                    <p>Try a different search term</p>
                  </div>
                )}

                {/* Load More Trigger */}
                {!searchTerm && hasMore && (
                  <div ref={loadMoreRef} className="load-more-trigger">
                    {loadingMore ? (
                      <div className="loading-more">
                        <div className="loading-spinner-small"></div>
                        <p>Loading more posts...</p>
                      </div>
                    ) : (
                      <p className="scroll-hint">Scroll for more...</p>
                    )}
                  </div>
                )}

                {!searchTerm && !hasMore && posts.length > 0 && (
                  <div className="feed-end">
                    <p>🎉 You've reached the end of your feed!</p>
                    <button onClick={() => navigate('/posts')}>
                      Browse All Posts
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="feed-sidebar">
            {/* Trending Posts */}
            {trendingPosts.length > 0 && (
              <div className="sidebar-section trending-section">
                <h3>🔥 Trending This Week</h3>
                <div className="trending-posts">
                  {trendingPosts.map(post => (
                    <div
                      key={post._id}
                      className="trending-post"
                      onClick={() => navigate(`/posts/${post._id}`)}
                    >
                      <div className="trending-post-header">
                        <img
                          src={post.user?.avatar || '/default-avatar.png'}
                          alt={post.user?.name}
                          className="trending-avatar"
                        />
                        <div>
                          <h4>{post.title}</h4>
                          <p className="trending-author">{post.user?.name}</p>
                        </div>
                      </div>
                      <div className="trending-stats">
                        <span>👁️ {post.stats?.views || 0}</span>
                        <span>❤️ {post.stats?.interests || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="sidebar-section stats-section">
              <h3>📊 Your Feed Stats</h3>
              <div className="feed-stats">
                <div className="stat-item">
                  <span className="stat-number">{posts.length}</span>
                  <span className="stat-label">Posts in Feed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {posts.filter(p => p.matchScore >= 70).length}
                  </span>
                  <span className="stat-label">Perfect Matches</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{page}</span>
                  <span className="stat-label">
                    of {totalPages || 1} pages
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="sidebar-section tips-section">
              <h3>💡 Tips</h3>
              <ul className="tips-list">
                <li>Create posts with your skills to get better matches</li>
                <li>Show interest in posts to improve recommendations</li>
                <li>Update your profile regularly</li>
                <li>Check trending posts for popular opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
