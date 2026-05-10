import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusSquare, 
  Search, 
  AlertCircle, 
  TrendingUp, 
  Eye, 
  Star, 
  Inbox, 
  Lightbulb, 
  Target,
  X,
  BarChart3,
  ArrowRight,
  Activity,
  Zap
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  
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

      const [feedData, trendingData] = await Promise.all([
        getPersonalizedFeed(1, 30),
        getTrendingPosts(5),
      ]);

      setPosts(feedData.data || feedData);
      setTrendingPosts(trendingData.data || trendingData);
      
      if (feedData.pagination) {
        setHasMore(feedData.pagination.hasMore);
      }
    } catch (err) {
      setError(err.message || 'Failed to load feed. Please try again.');
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="feed-loading-container">
        <div className="editorial-loader">
          <div className="loader-bar"></div>
          <p className="loader-text">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-container">
        <header className="feed-hero-nodal">
          <div className="hero-identity-nodal">
            <h1 className="editorial-title-large">Your Feed</h1>
            <p className="editorial-subtitle-nodal">Skill exchange posts and opportunities picked for you.</p>
          </div>
          <div className="hero-actions-nodal">
            <button
              className="btn-primary-nodal"
              onClick={() => navigate('/posts/create')}
            >
              <PlusSquare size={18} />
              <span>Share a Skill</span>
            </button>
          </div>
        </header>

        <div className="discovery-telemetry-grid">
          <div className="telemetry-card-compact">
            <div className="telemetry-icon-nodal"><Activity size={16} /></div>
            <div className="telemetry-data-nodal">
              <span className="telemetry-value-nodal">{posts.length}</span>
              <span className="telemetry-label-nodal">ACTIVE_SIGNALS</span>
            </div>
          </div>
          <div className="telemetry-card-compact">
            <div className="telemetry-icon-nodal"><Target size={16} /></div>
            <div className="telemetry-data-nodal">
              <span className="telemetry-value-nodal">{posts.filter(p => p.matchScore >= 70).length}</span>
              <span className="telemetry-label-nodal">HIGH_COMPATIBILITY</span>
            </div>
          </div>
          <div className="telemetry-card-compact">
            <div className="telemetry-icon-nodal"><Zap size={16} /></div>
            <div className="telemetry-data-nodal">
              <span className="telemetry-value-nodal">{trendingPosts.length}</span>
              <span className="telemetry-label-nodal">Trending</span>
            </div>
          </div>
        </div>

        <section className="search-registry-nodal">
          <div className="search-input-wrapper-nodal">
            <Search size={20} className="search-icon-nodal" />
            <input
              type="text"
              placeholder="Search by skill or topic..."
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
        </section>

        {error && (
          <div className="system-error-banner">
            <AlertCircle size={20} />
            <div className="error-log-nodal">
              <h3>SYSTEM_SYNC_ERROR</h3>
              <p>{error}</p>
            </div>
            <button className="btn-retry-nodal" onClick={fetchInitialData}>RE_SYNC</button>
          </div>
        )}

        <div className="feed-grid-layout-nodal">
          <main className="feed-primary-column">
            {posts.length === 0 ? (
              <div className="empty-registry-state">
                <Inbox size={48} strokeWidth={1} />
                <h2>Nothing here yet</h2>
                <p>Complete your profile or browse posts to get started.</p>
                <button
                  className="btn-secondary-nodal"
                  onClick={() => navigate('/posts')}
                >
                  EXPLORE_DIRECTORY
                </button>
              </div>
            ) : (
              <div className="posts-ledger-stack">
                {filteredPosts.map((post, index) => (
                  <PostCard
                    key={post._id || index}
                    post={post}
                    onInterestToggle={handleInterestToggle}
                    isOwner={post.user?._id === user?.uid}
                  />
                ))}
                
                {searchTerm && filteredPosts.length === 0 && (
                  <div className="no-matches-nodal">
                    <Search size={32} strokeWidth={1} />
                    <h3>No matches found</h3>
                    <p>Try different search terms or check back later.</p>
                  </div>
                )}

                {!searchTerm && hasMore && (
                  <div ref={loadMoreRef} className="registry-fetch-trigger">
                    {loadingMore ? (
                      <div className="mini-loader-nodal">
                        <div className="pulse-dot"></div>
                        <span>Loading more...</span>
                      </div>
                    ) : (
                      <div className="scroll-hint-nodal">
                        <span>SCAN_FOR_MORE</span>
                        <ArrowRight size={14} />
                      </div>
                    )}
                  </div>
                )}

                {!searchTerm && !hasMore && posts.length > 0 && (
                  <div className="registry-terminator">
                    <div className="terminator-line-nodal"></div>
                    <span className="terminator-label">You're all caught up!</span>
                    <div className="terminator-line-nodal"></div>
                  </div>
                )}
              </div>
            )}
          </main>

          <aside className="feed-sidebar-nodal">
            {trendingPosts.length > 0 && (
              <div className="sidebar-protocol-module">
                <div className="protocol-module-header">
                  <TrendingUp size={16} />
                  <span>TRENDING_SIGNALS</span>
                </div>
                <div className="trending-ledger">
                  {trendingPosts.map((post, idx) => (
                    <div
                      key={post._id}
                      className="trending-signal-item"
                      onClick={() => navigate(`/posts/${post._id}`)}
                    >
                      <div className="signal-rank">0{idx + 1}</div>
                      <div className="signal-meta-compact">
                        <h4>{post.title}</h4>
                        <div className="signal-telemetry-sm">
                          <span className="author-id">@{post.user?.name?.replace(/\s+/g, '_').toUpperCase()}</span>
                          <span className="view-count">
                            <Eye size={10} /> {post.stats?.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebar-protocol-module">
              <div className="protocol-module-header">
                <BarChart3 size={16} />
                <span>EXCHANGE_METRICS</span>
              </div>
              <div className="metrics-nodal-grid">
                <div className="metric-block-nodal">
                  <span className="metric-value-nodal">{posts.length * 12}</span>
                  <span className="metric-label-nodal">TOTAL_REACH</span>
                </div>
                <div className="metric-block-nodal">
                  <span className="metric-value-nodal">98%</span>
                  <span className="metric-label-nodal">UPTIME</span>
                </div>
              </div>
            </div>

            <div className="sidebar-protocol-module">
              <div className="protocol-module-header">
                <Lightbulb size={16} />
                <span>OPERATIONAL_TIPS</span>
              </div>
              <ul className="protocol-tip-list">
                <li>Optimize skill vectors for 3x engagement.</li>
                <li>Verify identity to unlock high-tier exchanges.</li>
                <li>Consistent broadcasting builds network reputation.</li>
                <li>Monitor trending signals for market shifts.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
