const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    thumbnail: {
      url: String,
      publicId: String,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skills: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
    }],
    price: {
      type: Number,
      default: 0, // Free course
      min: [0, 'Price cannot be negative'],
    },
    coinsRequired: {
      type: Number,
      default: 50, // Default coins required to unlock
      min: [0, 'Coins cannot be negative'],
    },
    videos: [{
      title: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      publicId: String,
      duration: Number, // in seconds
      order: {
        type: Number,
        default: 0,
      },
      hasDubbing: {
        type: Boolean,
        default: false,
      },
      dubbedAudioUrl: String, // Urdu dubbed audio URL
      dubbedAudioPublicId: String,
    }],
    documents: [{
      title: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      publicId: String,
      fileType: {
        type: String,
        enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'other'],
      },
      fileSize: Number, // in bytes
      order: {
        type: Number,
        default: 0,
      },
    }],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      default: 'all',
    },
    duration: {
      type: Number, // Total course duration in minutes
      default: 0,
    },
    enrollments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      enrolledAt: {
        type: Date,
        default: Date.now,
      },
      completedVideos: [{
        type: mongoose.Schema.Types.ObjectId,
      }],
      progress: {
        type: Number,
        default: 0, // Percentage 0-100
      },
    }],
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      enrollmentCount: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      ratingCount: {
        type: Number,
        default: 0,
      },
    },
    ratings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      review: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ['Programming', 'Design', 'Marketing', 'Business', 'Photography', 
             'Music', 'Fitness', 'Languages', 'Writing', 'Other'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ instructor: 1, createdAt: -1 });
courseSchema.index({ skills: 1 });
courseSchema.index({ isPublished: 1, createdAt: -1 });
courseSchema.index({ 'stats.enrollmentCount': -1 });
courseSchema.index({ 'stats.averageRating': -1 });

// Method to check if user has access to course content
courseSchema.methods.hasAccess = async function(userId) {
  // Instructor always has access
  if (this.instructor.toString() === userId.toString()) {
    return true;
  }

  // Check if user has completed a trade with instructor
  const Trade = mongoose.model('Trade');
  const completedTrade = await Trade.findOne({
    $or: [
      { teacher: this.instructor, learner: userId, status: 'completed' },
      { teacher: userId, learner: this.instructor, status: 'completed' }
    ]
  });

  return !!completedTrade;
};

// Method to enroll user in course
courseSchema.methods.enrollUser = async function(userId) {
  const existingEnrollment = this.enrollments.find(
    e => e.user.toString() === userId.toString()
  );

  if (existingEnrollment) {
    return { alreadyEnrolled: true };
  }

  this.enrollments.push({ user: userId });
  this.stats.enrollmentCount += 1;
  await this.save();

  return { success: true };
};

// Static method to get user's accessible courses
courseSchema.statics.getAccessibleCourses = async function(userId, instructorId) {
  const Trade = mongoose.model('Trade');
  
  // Check if there's a completed trade between users
  const hasCompletedTrade = await Trade.findOne({
    $or: [
      { teacher: instructorId, learner: userId, status: 'completed' },
      { teacher: userId, learner: instructorId, status: 'completed' }
    ]
  });

  const courses = await this.find({ 
    instructor: instructorId, 
    isPublished: true 
  })
    .populate('instructor', 'name avatar rating')
    .populate('skills', 'name category')
    .select('-enrollments -ratings') // Don't send full enrollment and rating data
    .sort('-createdAt');

  return {
    courses,
    hasAccess: !!hasCompletedTrade,
  };
};

module.exports = mongoose.model('Course', courseSchema);
