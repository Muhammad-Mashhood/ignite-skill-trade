import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Send, 
  ChevronLeft, 
  User, 
  Star, 
  Clock, 
  Check, 
  CheckCheck, 
  AlertCircle,
  MessageSquare,
  Zap,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
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

      let currentConversation = conversation;
      if (!currentConversation) {
        const convData = await createConversation(userId);
        currentConversation = convData;
        setConversation(convData);
      }

      if (currentConversation?._id) {
        const messagesData = await getMessages(currentConversation._id);
        setMessages(Array.isArray(messagesData) ? messagesData : messagesData.data || []);
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError(err.message || 'Failed to initialize transmission');
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

      let currentConversation = conversation;
      if (!currentConversation) {
        currentConversation = await createConversation(userId);
        setConversation(currentConversation);
      }

      const newMessage = await sendMessage(currentConversation._id, messageText.trim());
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send signal');
    } finally {
      setSending(false);
    }
  };

  const handleTextareaChange = (e) => {
    setMessageText(e.target.value);
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
      return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const otherUser = conversation?.otherUser || 
                    conversation?.participants?.find(p => p._id !== user?._id);

  if (loading && messages.length === 0) {
    return (
      <div className="chat-page">
        <div className="editorial-loader">
          <div className="loader-bar"></div>
          <span className="loader-text">INITIALIZING SIGNAL</span>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-interface">
        {/* Chat Header */}
        <header className="chat-header">
          <button className="btn-back-nodal" onClick={() => navigate('/inbox')}>
            <ChevronLeft size={20} />
          </button>
          
          <div className="chat-participant-context">
            <div className="avatar-nodal">
              {otherUser?.avatar ? (
                <img src={otherUser.avatar} alt={otherUser.name} />
              ) : (
                <User size={18} />
              )}
              <div className="online-indicator"></div>
            </div>
            <div className="participant-meta">
              <div className="name-row">
                <h3>{otherUser?.name || 'ANONYMOUS'}</h3>
                {otherUser?.rating && <span className="rating-badge"><Star size={8} fill="currentColor" /> {otherUser.rating.average.toFixed(1)}</span>}
              </div>
              <span className="status-text">ENCRYPTED CHANNEL</span>
            </div>
          </div>

          <div className="header-actions">
            <button className="btn-icon-editorial"><ShieldCheck size={18} /></button>
            <button className="btn-icon-editorial"><MoreVertical size={18} /></button>
          </div>
        </header>

        {/* Messages Area */}
        <main className="chat-feed">
          {error && (
            <div className="editorial-error-banner">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="empty-feed-state">
              <div className="visual">
                <MessageSquare size={48} strokeWidth={1} />
              </div>
              <h3>No messages yet</h3>
              <p>Say hello to {otherUser?.name || 'your contact'} and start the conversation.</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => {
                const isOwnMessage = message.sender?._id === user?._id || message.sender === user?._id;
                
                return (
                  <div
                    key={message._id}
                    className={`message-ledger-item ${isOwnMessage ? 'outgoing' : 'incoming'}`}
                  >
                    {!isOwnMessage && (
                      <div className="msg-avatar-nodal">
                        {message.sender?.avatar ? (
                          <img src={message.sender.avatar} alt={message.sender.name} />
                        ) : (
                          <User size={12} />
                        )}
                      </div>
                    )}
                    <div className="message-envelope">
                      <div className="bubble">
                        <p>{message.content}</p>
                      </div>
                      <div className="message-meta">
                        <span className="timestamp">{formatMessageTime(message.createdAt)}</span>
                        {isOwnMessage && (
                          <span className="delivery-status">
                            {message.isRead ? <CheckCheck size={12} className="read" /> : <Check size={12} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Message Input Area */}
        <footer className="chat-controls">
          <div className="input-toolbar">
            <button className="btn-tool"><Paperclip size={18} /></button>
            <button className="btn-tool"><ImageIcon size={18} /></button>
          </div>
          
          <form className="signal-input-cluster" onSubmit={handleSendMessage}>
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="ENTER SIGNAL..."
              rows="1"
              disabled={sending}
            />
            <button 
              type="submit" 
              className="btn-send-signal"
              disabled={!messageText.trim() || sending}
            >
              {sending ? <Clock size={18} className="spin" /> : <Send size={18} />}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ChatPage;
