const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteMessage,
  archiveConversation,
} = require('../controllers/message.controller');

// All routes are protected
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/archive', archiveConversation);

// Message routes
router.get('/unread-count', getUnreadCount);
router.delete('/:messageId', deleteMessage);

module.exports = router;
