const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    // User who created the post
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Type of post: trade skill post
    type: {
      type: String,
      enum: ['trade'],
      default: 'trade',
      required: [true, 'Post type is required'],
      index: true,
    },
    
    // Skills the user will teach
    willTeach: [{
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
      customSkillName: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner',
      },
      description: String,
    }],
    
    // Skills the user wants to learn (can be multiple)
    wantToLearn: [{
      skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
      },
      customSkillName: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner',
      },
      description: String,
    }],
    
    // Post title
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    
    // Detailed description
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    
    // Skill level for teaching posts
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    
    // Duration per session (in minutes)
    duration: {
      type: Number,
      min: [15, 'Session must be at least 15 minutes'],
      max: [480, 'Session cannot exceed 8 hours'],
    },
    
    // Coin price per session (for gigs)
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      max: [1000, 'Price cannot exceed 1000'],
    },
    
    // Languages the teacher/learner speaks
    languages: [{
      type: String,
      trim: true,
    }],
    
    // Availability schedule
    availability: {
      timezone: {
        type: String,
        default: 'UTC',
      },
      schedule: [{
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        slots: [{
          startTime: String, // Format: "HH:MM"
          endTime: String,   // Format: "HH:MM"
        }],
      }],
    },
    
    // Tags for better searchability
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    
    // Media attachments (images/videos)
    media: [{
      type: {
        type: String,
        enum: ['image', 'video'],
      },
      url: String,
      thumbnail: String, // For videos
    }],
    
    // Course cover/thumbnail image
    coverImage: {
      url: String,
      publicId: String, // Cloudinary public ID for deletion
    },
    
    // Course curriculum (for course-type gigs)
    curriculum: [{
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      order: {
        type: Number,
        default: 0,
      },
      lessons: [{
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          enum: ['video', 'article', 'quiz', 'assignment', 'resource'],
          default: 'video',
        },
        content: {
          videoUrl: String,
          articleContent: String,
          resourceUrl: String,
          duration: Number, // in minutes
        },
        order: {
          type: Number,
          default: 0,
        },
        isFree: {
          type: Boolean,
          default: false, // Preview lessons
        },
      }],
    }],
    
    // Total course duration (auto-calculated)
    totalDuration: {
      type: Number, // in minutes
      default: 0,
    },
    
    // Enrolled students (who purchased the course)
    enrolledStudents: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      enrolledAt: {
        type: Date,
        default: Date.now,
      },
      progress: {
        type: Number,
        default: 0, // Percentage
        min: 0,
        max: 100,
      },
      completedLessons: [{
        type: String, // lesson ID
      }],
    }],
    
    // Requirements for learners (if teaching)
    requirements: [{
      type: String,
      trim: true,
    }],
    
    // What learners will gain
    outcomes: [{
      type: String,
      trim: true,
    }],
    
    // Post status
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'deleted'],
      default: 'active',
      index: true,
    },
    
    // Maximum number of students (for teaching posts)
    maxStudents: {
      type: Number,
      min: 1,
      max: 100,
    },
    
    // Alias for maxStudents to support frontend field name
    maxParticipants: {
      type: Number,
      min: 1,
      max: 100,
    },
    
    // Current number of enrolled students
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Linked course (for course-based posts)
    linkedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
    
    // Post statistics
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      interests: {
        type: Number,
        default: 0,
      },
      completedSessions: {
        type: Number,
        default: 0,
      },
    },
    
    // Track users who viewed this post (for unique view counting)
    viewedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    // Track users who showed interest (for toggle functionality)
    interestedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    // Average rating for this specific post/gig
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    
    // Featured/Boosted post (for future premium features)
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    // Expiry date for the post
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
postSchema.index({ type: 1, status: 1, createdAt: -1 });
postSchema.index({ skill: 1, type: 1, status: 1 });
postSchema.index({ 'availability.timezone': 1 });
postSchema.index({ tags: 1 });
postSchema.index({ coinsPerSession: 1 });
postSchema.index({ featured: 1, createdAt: -1 });

// Virtual for checking if post is still valid
postSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.expiresAt > new Date();
});

// Virtual for checking if post has available slots
postSchema.virtual('hasAvailableSlots').get(function() {
  return this.enrolledCount < this.maxStudents;
});

// Method to increment view count (only for unique users)
postSchema.methods.incrementViews = async function(userId) {
  if (userId) {
    // Check if user already viewed (convert to string for comparison)
    const hasViewed = this.viewedBy.some(id => id.toString() === userId.toString());
    
    if (!hasViewed) {
      this.viewedBy.push(userId);
      this.stats.views = (this.stats.views || 0) + 1;
      await this.save();
    }
  } else {
    // Anonymous view (no user logged in) - always count
    this.stats.views = (this.stats.views || 0) + 1;
    await this.save();
  }
  return this;
};

// Method to toggle interest (add or remove)
postSchema.methods.toggleInterest = async function(userId) {
  // Convert userId to string for comparison
  const userIdStr = userId.toString();
  const userIndex = this.interestedUsers.findIndex(id => id.toString() === userIdStr);
  
  if (userIndex > -1) {
    // User already interested, remove them
    this.interestedUsers.splice(userIndex, 1);
    this.stats.interests = Math.max(0, (this.stats.interests || 0) - 1);
  } else {
    // User not interested yet, add them
    this.interestedUsers.push(userId);
    this.stats.interests = (this.stats.interests || 0) + 1;
  }
  
  await this.save();
  return this;
};

// Legacy method (keep for compatibility)
postSchema.methods.incrementInterests = async function() {
  this.stats.interests += 1;
  return this.save();
};

// Method to enroll a student
postSchema.methods.enrollStudent = async function() {
  if (this.enrolledCount >= this.maxStudents) {
    throw new Error('Maximum students reached');
  }
  this.enrolledCount += 1;
  return this.save();
};

// Method to unenroll a student
postSchema.methods.unenrollStudent = async function() {
  if (this.enrolledCount > 0) {
    this.enrolledCount -= 1;
    return this.save();
  }
};

// Method to update rating
postSchema.methods.updateRating = async function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Method to calculate total course duration
postSchema.methods.calculateTotalDuration = function() {
  let total = 0;
  if (this.curriculum && this.curriculum.length > 0) {
    this.curriculum.forEach(section => {
      if (section.lessons && section.lessons.length > 0) {
        section.lessons.forEach(lesson => {
          if (lesson.content && lesson.content.duration) {
            total += lesson.content.duration;
          }
        });
      }
    });
  }
  this.totalDuration = total;
  return total;
};

// Method to check if user has purchased/enrolled
postSchema.methods.isUserEnrolled = function(userId) {
  if (!userId) return false;
  return this.enrolledStudents.some(enrollment => 
    enrollment.user.toString() === userId.toString()
  );
};

// Method to enroll a user in course
postSchema.methods.enrollUser = async function(userId) {
  if (this.isUserEnrolled(userId)) {
    throw new Error('User already enrolled');
  }
  
  this.enrolledStudents.push({
    user: userId,
    enrolledAt: new Date(),
    progress: 0,
    completedLessons: [],
  });
  
  this.enrolledCount += 1;
  return this.save();
};

// Static method to find active posts
postSchema.statics.findActivePosts = function(filters = {}) {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() },
    ...filters,
  })
    .populate('user', 'name email avatar rating')
    .populate('skill', 'name category')
    .sort({ featured: -1, createdAt: -1 });
};

// Static method to search posts
postSchema.statics.searchPosts = function(searchTerm, filters = {}) {
  return this.find({
    status: 'active',
    expiresAt: { $gt: new Date() },
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } },
    ],
    ...filters,
  })
    .populate('user', 'name email avatar rating')
    .populate('skill', 'name category')
    .sort({ featured: -1, 'stats.views': -1 });
};

// Pre-save middleware to validate
postSchema.pre('save', function(next) {
  // Ensure enrolled count doesn't exceed max students
  if (this.enrolledCount > this.maxStudents) {
    this.enrolledCount = this.maxStudents;
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
