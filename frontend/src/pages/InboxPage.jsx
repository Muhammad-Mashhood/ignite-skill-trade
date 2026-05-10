import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  User, 
  Clock, 
  Inbox, 
  ArrowRight, 
  AlertCircle,
  FileText,
  ChevronRight,
  MoreVertical,
  Zap,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getConversations } from '../services/api';
import './InboxPage.css';

const InboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getConversations();
      
      let conversationsData = [];
      if (Array.isArray(response)) {
        conversationsData = response;
      } else if (response.data) {
        conversationsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (response.conversations) {
        conversationsData = response.conversations;
      }
      
      setConversations(conversationsData);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load transmission logs');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const handleConversationClick = (conversation) => {
    navigate(`/chat/${conversation.otherUser._id}`, {
      state: { conversation }
    });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    const otherUserName = conv.otherUser?.name?.toLowerCase() || '';
    const otherUserEmail = conv.otherUser?.email?.toLowerCase() || '';
    const lastMessageContent = conv.lastMessage?.content?.toLowerCase() || '';
    return otherUserName.includes(searchLower) || otherUserEmail.includes(searchLower) || lastMessageContent.includes(searchLower);
  });

  if (loading && conversations.length === 0) {
    return (
      <div className="inbox-page">
        <div className="editorial-loader">
          <div className="loader-bar"></div>
          <span className="loader-text">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-page">
      <header className="inbox-hero">
        <div className="hero-content">
          <h1 className="editorial-title">Messages</h1>
          <p className="editorial-subtitle">Your conversations and skill exchange chats.</p>
        </div>
        <div className="hero-search-cluster">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="FILTER SIGNALS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="inbox-main">
        {error && (
          <div className="editorial-error-card">
            <AlertCircle size={24} />
            <div className="error-content">
              <h3>TRANSMISSION ERROR</h3>
              <p>{error}</p>
            </div>
            <button onClick={fetchConversations} className="btn-retry">RETRY</button>
          </div>
        )}

        {!error && filteredConversations.length === 0 && (
          <div className="inbox-empty-state">
            <div className="empty-visual">
              {searchTerm ? <Search size={64} strokeWidth={1} /> : <MessageSquare size={64} strokeWidth={1} />}
            </div>
            <h3>{searchTerm ? 'No results found' : 'No messages yet'}</h3>
            <p>{searchTerm ? 'Try a different search term.' : 'Start a conversation by visiting a post or profile.'}</p>
            {!searchTerm && (
              <button onClick={() => navigate('/posts')} className="editorial-btn-primary">
                <span>Browse Posts</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        <div className="conversations-ledger">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`ledger-item ${conversation.unreadCount > 0 ? 'unread' : ''}`}
              onClick={() => handleConversationClick(conversation)}
            >
              <div className="item-nodal">
                <div className="avatar-nodal">
                  {conversation.otherUser?.avatar ? (
                    <img src={conversation.otherUser.avatar} alt={conversation.otherUser.name} />
                  ) : (
                    <User size={18} />
                  )}
                  {conversation.unreadCount > 0 && (
                    <span className="unread-pulse"></span>
                  )}
                </div>
              </div>

              <div className="item-content">
                <div className="content-header">
                  <div className="participant-row">
                    <h3 className="name">{conversation.otherUser?.name || 'ANONYMOUS'}</h3>
                    {conversation.unreadCount > 0 && <span className="unread-tag">{conversation.unreadCount} NEW</span>}
                  </div>
                  <span className="timestamp">
                    <Clock size={10} />
                    {formatTimestamp(conversation.lastMessageAt)}
                  </span>
                </div>

                <div className="content-preview">
                  {conversation.lastMessage?.content ? (
                    <p className={conversation.unreadCount > 0 ? 'unread-text' : ''}>
                      {conversation.lastMessage.sender === user?._id && <span className="prefix">YOU:</span>}
                      {conversation.lastMessage.content}
                    </p>
                  ) : (
                    <p className="no-messages">SIGNAL READY FOR INITIALIZATION</p>
                  )}
                </div>

                {conversation.relatedPost && (
                  <div className="content-context">
                    <FileText size={10} />
                    <span>OBJECTIVE: {conversation.relatedPost.title.toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className="item-actions">
                <ChevronRight size={18} className="chevron" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
