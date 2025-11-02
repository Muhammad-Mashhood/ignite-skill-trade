const mongoose = require('mongoose');

const tradeProposalSchema = new mongoose.Schema(
  {
    // Who is proposing the trade
    proposer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // The post they're responding to
    targetPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    
    // Owner of the target post
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Type of proposal
    proposalType: {
      type: String,
      enum: ['trade', 'buy', 'chat'], // trade skills, buy with coins, or just chat
      required: true,
    },
    
    // If proposing a trade: What the proposer is offering
    offering: {
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
      customSkillName: String,
      description: String,
      // Reference to proposer's post if they have one
      postReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    },
    
    // Message from proposer
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    
    // Status of the proposal
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'completed'],
      default: 'pending',
      index: true,
    },
    
    // Number of sessions (for online classes)
    numberOfSessions: {
      type: Number,
      min: 1,
      default: 1,
    },
    
    // Scheduled sessions (for accepted trades/purchases)
    scheduledSessions: [{
      date: Date,
      startTime: String, // "HH:MM"
      endTime: String,   // "HH:MM"
      meetingLink: String,
      status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled',
      },
      completedAt: Date,
    }],
    
    // Trade details (if accepted)
    tradeDetails: {
      agreedTerms: String,
      startDate: Date,
      endDate: Date,
    },
    
    // Response from receiver
    response: {
      message: String,
      respondedAt: Date,
    },
    
    // Rating after completion
    rating: {
      proposerRating: {
        score: Number, // 1-5
        feedback: String,
        ratedAt: Date,
      },
      receiverRating: {
        score: Number,
        feedback: String,
        ratedAt: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
tradeProposalSchema.index({ proposer: 1, status: 1 });
tradeProposalSchema.index({ receiver: 1, status: 1 });
tradeProposalSchema.index({ targetPost: 1, status: 1 });
tradeProposalSchema.index({ createdAt: -1 });

// Virtual to check if proposal is still active
tradeProposalSchema.virtual('isActive').get(function() {
  return ['pending', 'accepted'].includes(this.status);
});

// Method to accept proposal
tradeProposalSchema.methods.accept = async function(responseMessage) {
  this.status = 'accepted';
  this.response = {
    message: responseMessage,
    respondedAt: new Date(),
  };
  return this.save();
};

// Method to reject proposal
tradeProposalSchema.methods.reject = async function(responseMessage) {
  this.status = 'rejected';
  this.response = {
    message: responseMessage,
    respondedAt: new Date(),
  };
  return this.save();
};

// Method to add scheduled session
tradeProposalSchema.methods.addSession = async function(sessionData) {
  this.scheduledSessions.push({
    date: sessionData.date,
    startTime: sessionData.startTime,
    endTime: sessionData.endTime,
    meetingLink: sessionData.meetingLink,
    status: 'scheduled',
  });
  return this.save();
};

// Method to complete a session
tradeProposalSchema.methods.completeSession = async function(sessionId) {
  const session = this.scheduledSessions.id(sessionId);
  if (session) {
    session.status = 'completed';
    session.completedAt = new Date();
    
    // Check if all sessions are completed
    const allCompleted = this.scheduledSessions.every(s => s.status === 'completed');
    if (allCompleted) {
      this.status = 'completed';
    }
    
    return this.save();
  }
  throw new Error('Session not found');
};

const TradeProposal = mongoose.model('TradeProposal', tradeProposalSchema);

module.exports = TradeProposal;
