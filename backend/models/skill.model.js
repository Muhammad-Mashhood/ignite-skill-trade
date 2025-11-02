const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a skill name'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: [
        'Programming',
        'Design',
        'Business',
        'Marketing',
        'Music',
        'Languages',
        'Photography',
        'Writing',
        'Cooking',
        'Fitness',
        'Other',
      ],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    icon: String,
    tags: [String],
    popularityScore: {
      type: Number,
      default: 0,
    },
    totalTeachers: {
      type: Number,
      default: 0,
    },
    totalLearners: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Skill', skillSchema);
