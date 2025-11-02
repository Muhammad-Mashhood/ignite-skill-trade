const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    coinsAmount: {
      type: Number,
      required: true,
      default: 50,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in-progress', 'completed', 'cancelled', 'disputed'],
      default: 'pending',
    },
    sessionType: {
      type: String,
      enum: ['video-call', 'chat', 'recorded', 'project-review'],
      default: 'video-call',
    },
    scheduledAt: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    sessionLink: String, // WebRTC room link or recorded video link
    notes: {
      type: String,
      maxlength: 1000,
    },
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      ratedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      ratedAt: Date,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trade', tradeSchema);
