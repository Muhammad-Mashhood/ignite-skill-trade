import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      console.log('Conversations response:', response);
      
      // Handle different response formats
      let conversationsData = [];
      if (Array.isArray(response)) {
        conversationsData = response;
      } else if (response.data) {
        conversationsData = Array.isArray(response.data) ? response.data : [response.data];
      } else if (response.conversations) {
        conversationsData = response.conversations;
      }
      
      console.log('Parsed conversations:', conversationsData);
      setConversations(conversationsData);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations');
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
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
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
    
    return otherUserName.includes(searchLower) || 
           otherUserEmail.includes(searchLower) ||
           lastMessageContent.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="inbox-page">
        <div className="inbox-loading">
          <div className="spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inbox-page">
      <div className="inbox-container">
        <div className="inbox-header">
          <h1>📬 Inbox</h1>
          <div className="inbox-search">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="inbox-error">
            <p>⚠️ {error}</p>
            <button onClick={fetchConversations}>Try Again</button>
          </div>
        )}

        {!error && filteredConversations.length === 0 && (
          <div className="inbox-empty">
            {searchTerm ? (
              <>
                <p className="empty-icon">🔍</p>
                <h3>No conversations found</h3>
                <p>Try a different search term</p>
              </>
            ) : (
              <>
                <p className="empty-icon">💬</p>
                <h3>No messages yet</h3>
                <p>Start a conversation by sending a message from a post or proposal</p>
                <button onClick={() => navigate('/posts')} className="btn-primary">
                  Browse Posts
                </button>
              </>
            )}
          </div>
        )}

        <div className="conversations-list">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''}`}
              onClick={() => handleConversationClick(conversation)}
            >
              <div className="conversation-avatar">
                {conversation.otherUser?.avatar ? (
                  <img src={conversation.otherUser.avatar} alt={conversation.otherUser.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {conversation.otherUser?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                {conversation.unreadCount > 0 && (
                  <span className="unread-badge">{conversation.unreadCount}</span>
                )}
              </div>

              <div className="conversation-content">
                <div className="conversation-header-row">
                  <h3 className="conversation-name">
                    {conversation.otherUser?.name || 'Unknown User'}
                  </h3>
                  <span className="conversation-time">
                    {formatTimestamp(conversation.lastMessageAt)}
                  </span>
                </div>

                <div className="conversation-preview">
                  {conversation.lastMessage?.content ? (
                    <p className={conversation.unreadCount > 0 ? 'unread-text' : ''}>
                      {conversation.lastMessage.sender === user?._id ? 'You: ' : ''}
                      {conversation.lastMessage.content.length > 60
                        ? conversation.lastMessage.content.substring(0, 60) + '...'
                        : conversation.lastMessage.content}
                    </p>
                  ) : (
                    <p className="no-messages">No messages yet</p>
                  )}
                </div>

                {conversation.relatedPost && (
                  <div className="conversation-context">
                    📄 Related to: {conversation.relatedPost.title}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
