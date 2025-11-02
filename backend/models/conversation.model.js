const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    relatedProposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TradeProposal',
    },
    relatedTrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ 'participants': 1, lastMessageAt: -1 });

// Method to get or create conversation between two users
conversationSchema.statics.findOrCreate = async function(user1Id, user2Id, relatedData = {}) {
  const mongoose = require('mongoose');
  
  // Convert to ObjectIds and sort as strings for consistent lookup
  const id1 = new mongoose.Types.ObjectId(user1Id);
  const id2 = new mongoose.Types.ObjectId(user2Id);
  const participantIds = [id1.toString(), id2.toString()].sort().map(id => new mongoose.Types.ObjectId(id));
  
  // Try to find existing conversation with these exact participants
  let conversation = await this.findOne({
    $and: [
      { participants: id1 },
      { participants: id2 },
      { participants: { $size: 2 } }
    ]
  });

  if (!conversation) {
    conversation = await this.create({
      participants: participantIds,
      ...relatedData,
      unreadCount: {
        [user1Id.toString()]: 0,
        [user2Id.toString()]: 0,
      },
    });
  }

  return conversation;
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnread = async function(userId) {
  if (!this.unreadCount) {
    this.unreadCount = new Map();
  }
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Method to reset unread count for a user
conversationSchema.methods.resetUnread = async function(userId) {
  if (!this.unreadCount) {
    this.unreadCount = new Map();
  }
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
