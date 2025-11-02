const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');

// @desc    Get all conversations for logged-in user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      archivedBy: { $ne: userId },
    })
      .populate('participants', 'name email avatar rating')
      .populate('lastMessage')
      .populate('relatedPost', 'title')
      .populate('relatedProposal', 'proposalType')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Format conversations with other participant info
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      
      return {
        ...conv,
        otherUser: otherParticipant,
        unreadCount: conv.unreadCount?.[userId.toString()] || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedConversations.length,
      data: formattedConversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    next(error);
  }
};

// @desc    Get or create conversation with another user
// @route   POST /api/messages/conversations
// @access  Private
exports.createConversation = async (req, res, next) => {
  try {
    const { recipientId, relatedPost, relatedProposal, relatedTrade } = req.body;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required',
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found',
      });
    }

    const relatedData = {};
    if (relatedPost) relatedData.relatedPost = relatedPost;
    if (relatedProposal) relatedData.relatedProposal = relatedProposal;
    if (relatedTrade) relatedData.relatedTrade = relatedTrade;

    const conversation = await Conversation.findOrCreate(
      req.user._id,
      recipientId,
      relatedData
    );

    await conversation.populate('participants', 'name email avatar rating');
    await conversation.populate('lastMessage');

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:conversationId/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversation: conversationId,
      deletedBy: { $ne: req.user._id },
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Message.countDocuments({
      conversation: conversationId,
      deletedBy: { $ne: req.user._id },
    });

    // Mark unread messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user._id,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    // Reset unread count
    await conversation.resetUnread(req.user._id);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: messages.reverse(), // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages/conversations/:conversationId/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation',
      });
    }

    // Get receiver (other participant)
    const receiverId = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim(),
      attachments: attachments || [],
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.incrementUnread(receiverId);

    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    next(error);
  }
};

// @desc    Delete message (soft delete)
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    message.deletedBy.push(req.user._id);
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    next(error);
  }
};

// @desc    Archive conversation
// @route   PUT /api/messages/conversations/:conversationId/archive
// @access  Private
exports.archiveConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.archivedBy) {
      conversation.archivedBy = [];
    }

    if (!conversation.archivedBy.includes(req.user._id)) {
      conversation.archivedBy.push(req.user._id);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Conversation archived',
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    next(error);
  }
};
