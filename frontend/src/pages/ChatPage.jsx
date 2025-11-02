import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createConversation, getMessages, sendMessage } from '../services/api';
import './ChatPage.css';

const ChatPage = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversation, setConversation] = useState(location.state?.conversation || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isInitialized) {
      initializeChat();
    }
  }, [userId, isInitialized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      setError('');

      // Get or create conversation
      let currentConversation = conversation;
      if (!currentConversation) {
        const convData = await createConversation(userId);
        currentConversation = convData;
        setConversation(convData);
      }

      // Fetch messages
      if (currentConversation?._id) {
        const messagesData = await getMessages(currentConversation._id);
        setMessages(Array.isArray(messagesData) ? messagesData : messagesData.data || []);
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError(err.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) return;

    try {
      setSending(true);
      setError('');

      // Ensure we have a conversation
      let currentConversation = conversation;
      if (!currentConversation) {
        currentConversation = await createConversation(userId);
        setConversation(currentConversation);
      }

      const newMessage = await sendMessage(currentConversation._id, messageText.trim());
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleTextareaChange = (e) => {
    setMessageText(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageTime = (date) => {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const otherUser = conversation?.otherUser || 
                    conversation?.participants?.find(p => p._id !== user?._id);

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-loading">
          <div className="spinner"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Chat Header */}
        <div className="chat-header">
          <button className="back-button" onClick={() => navigate('/inbox')}>
            ← Back
          </button>
          <div className="chat-user-info">
            {otherUser?.avatar ? (
              <img src={otherUser.avatar} alt={otherUser.name} className="chat-avatar" />
            ) : (
              <div className="chat-avatar-placeholder">
                {otherUser?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div className="chat-user-details">
              <h2>{otherUser?.name || 'Unknown User'}</h2>
              {otherUser?.rating && (
                <span className="chat-user-rating">
                  ⭐ {otherUser.rating.average.toFixed(1)} ({otherUser.rating.count} reviews)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {error && (
            <div className="chat-error">
              <p>⚠️ {error}</p>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="no-messages">
              <p className="empty-icon">💬</p>
              <h3>No messages yet</h3>
              <p>Start the conversation by sending a message</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => {
                // Compare MongoDB _id for accurate message ownership
                const isOwnMessage = message.sender?._id === user?._id || 
                                   message.sender === user?._id;
                
                return (
                  <div
                    key={message._id}
                    className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}
                  >
                    {!isOwnMessage && (
                      <div className="message-avatar">
                        {message.sender?.avatar ? (
                          <img src={message.sender.avatar} alt={message.sender.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {message.sender?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="message-content">
                      <div className="message-bubble">
                        <p>{message.content}</p>
                      </div>
                      <span className="message-time">
                        {formatMessageTime(message.createdAt)}
                        {isOwnMessage && message.isRead && ' · Read'}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <form className="message-input-container" onSubmit={handleSendMessage}>
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Shift + Enter for new line)"
            rows="1"
            disabled={sending}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!messageText.trim() || sending}
          >
            {sending ? '⏳' : '📤'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
