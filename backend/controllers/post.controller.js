const Post = require('../models/post.model');
const User = require('../models/user.model');
const Skill = require('../models/skill.model');

// @desc    Create a new post/gig
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const {
      type,
      gigType,
      skill,
      customSkillName,
      title,
      description,
      level,
      duration,
      price,
      languages,
      availability,
      tags,
      requirements,
      outcomes,
      maxParticipants,
      maxStudents,
      coverImage,
      curriculum,
    } = req.body;

    // Validate required fields
    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and description are required',
      });
    }

    // Validate gigType for gig posts
    if (type === 'gig' && !gigType) {
      return res.status(400).json({
        success: false,
        message: 'Gig type (course or online-class) is required for gig posts',
      });
    }

    // Handle skill - check if it's an ObjectId or a skill name
    let skillId = null;
    if (skill) {
      // Check if skill is a valid ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(skill);
      
      if (isObjectId) {
        // It's an ObjectId, verify it exists
        const skillExists = await Skill.findById(skill);
        if (!skillExists) {
          return res.status(404).json({
            success: false,
            message: 'Skill not found',
          });
        }
        skillId = skill;
      } else {
        // It's a skill name, try to find or create it
        // Escape special regex characters to prevent regex errors
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let skillDoc = await Skill.findOne({ name: new RegExp(`^${escapedSkill}$`, 'i') });
        
        if (!skillDoc) {
          // Create new skill if it doesn't exist
          skillDoc = await Skill.create({
            name: skill,
            category: 'Other', // Default category
            description: `Skill: ${skill}`,
          });
        }
        skillId = skillDoc._id;
      }
    }

    // Create post
    const postData = {
      user: req.user._id,
      type,
      skill: skillId,
      customSkillName,
      title,
      description,
      level,
      duration,
      price,
      languages,
      availability,
      tags,
      requirements,
      outcomes,
      maxParticipants: maxParticipants || maxStudents,
    };

    // Add gig-specific fields
    if (type === 'gig') {
      postData.gigType = gigType;
      if (coverImage) postData.coverImage = coverImage;
      if (curriculum) postData.curriculum = curriculum;
    }

    const post = await Post.create(postData);

    // Calculate total duration if curriculum exists
    if (post.curriculum && post.curriculum.length > 0) {
      post.calculateTotalDuration();
      await post.save();
    }

    // Populate user and skill info
    await post.populate('user', 'name email avatar rating');
    if (skillId) {
      await post.populate('skill', 'name category');
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts with filters
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    const {
      type,
      skill,
      level,
      skillLevel,
      minCoins,
      maxCoins,
      languages,
      tags,
      search,
      status,
      page = 1,
      limit = 20,
      sort,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    // Build filter object
    const filters = {};

    if (type) filters.type = type;
    if (skill) filters.skill = skill;
    if (level || skillLevel) filters.level = level || skillLevel;
    if (status) filters.status = status;
    else filters.status = 'active'; // Default to active posts

    // Coin price range
    if (minCoins || maxCoins) {
      filters.price = {};
      if (minCoins) filters.price.$gte = Number(minCoins);
      if (maxCoins) filters.price.$lte = Number(maxCoins);
    }

    // Languages filter
    if (languages) {
      const langArray = languages.split(',');
      filters.languages = { $in: langArray };
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',');
      filters.tags = { $in: tagArray };
    }

    // Search query
    let query;
    if (search) {
      // Simple text search
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customSkillName: { $regex: search, $options: 'i' } },
      ];
    }

    query = Post.find(filters)
      .populate('user', 'name email avatar rating')
      .populate('willTeach.skill', 'name category')
      .populate('wantToLearn.skill', 'name category')
      .populate('linkedCourse', 'title thumbnail description level skills');

    // Sorting - handle both 'sort' and 'sortBy' parameters
    let sortOptions = {};
    
    if (sort) {
      // Handle MongoDB sort format (e.g., '-createdAt')
      if (sort.startsWith('-')) {
        sortOptions[sort.substring(1)] = -1;
      } else {
        sortOptions[sort] = 1;
      }
    } else {
      const sortOrder = order === 'desc' ? -1 : 1;
      
      if (sortBy === 'price') {
        sortOptions.price = sortOrder;
      } else if (sortBy === 'rating') {
        sortOptions['rating.average'] = sortOrder;
      } else if (sortBy === 'popular') {
        sortOptions['stats.views'] = -1;
      } else {
        sortOptions[sortBy] = sortOrder;
      }
    }

    query = query.sort(sortOptions);

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await query.skip(skip).limit(limitNum);
    const total = await Post.countDocuments(filters);

    // Add isInterested flag for logged-in user
    const postsWithInterestFlag = posts.map(post => {
      const postObj = post.toObject();
      if (req.user) {
        postObj.isInterested = post.interestedUsers.some(
          id => id.toString() === req.user.id
        );
      }
      return postObj;
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: postsWithInterestFlag,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name email avatar rating languages timezone')
      .populate('willTeach.skill', 'name category description')
      .populate('wantToLearn.skill', 'name category description')
      .populate('linkedCourse', 'title thumbnail description level skills instructor');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view count (but not if viewing own post)
    // Pass userId if user is logged in for unique view tracking
    const userId = req.user?.id;
    if (!userId || post.user._id.toString() !== userId) {
      await post.incrementViews(userId);
    }

    // Add isInterested flag for logged-in user
    const postObj = post.toObject();
    if (req.user) {
      postObj.isInterested = post.interestedUsers.some(
        id => id.toString() === req.user.id
      );
    }

    res.status(200).json({
      success: true,
      data: postObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own posts
// @route   GET /api/posts/my/posts
// @access  Private
exports.getMyPosts = async (req, res, next) => {
  try {
    const { type, status } = req.query;

    console.log('=== GET MY POSTS ===');
    console.log('User ID:', req.user._id);
    console.log('User Firebase UID:', req.user.firebaseUid);

    // Build query - user field should match the logged-in user's _id
    const query = { user: req.user._id };
    if (type && type !== 'all') query.type = type;
    if (status) query.status = status;

    console.log('Query:', query);

    // Find posts
    const posts = await Post.find(query)
      .populate('user', 'name email avatar')
      .populate('willTeach.skill', 'name category')
      .populate('wantToLearn.skill', 'name category')
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found posts:', posts.length);
    
    // Debug: Show all posts in database
    const totalPosts = await Post.countDocuments({});
    console.log('Total posts in DB:', totalPosts);
    
    if (posts.length === 0 && totalPosts > 0) {
      // Check if any posts exist at all
      const samplePosts = await Post.find({}).limit(3).select('user title').lean();
      console.log('Sample posts:', samplePosts.map(p => ({
        title: p.title,
        userId: p.user?.toString(),
        matches: p.user?.toString() === req.user._id.toString()
      })));
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error('Error in getMyPosts:', error);
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'title',
      'description',
      'skillLevel',
      'sessionDuration',
      'coinsPerSession',
      'languages',
      'availability',
      'tags',
      'requirements',
      'outcomes',
      'maxStudents',
      'status',
    ];

    // Filter req.body to only allowed fields
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    post = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email avatar rating')
      .populate('skill', 'name category');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    // Soft delete by setting status to deleted
    post.status = 'deleted';
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle interest in a post (add or remove)
// @route   POST /api/posts/:id/interest
// @access  Private
exports.markInterest = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Can't mark interest in own post
    if (post.user.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark interest in your own post',
      });
    }

    // Toggle interest (add or remove)
    await post.toggleInterest(req.user.id);
    
    // Check if user is now interested
    const isInterested = post.interestedUsers.includes(req.user.id);

    res.status(200).json({
      success: true,
      message: isInterested ? 'Interest marked successfully' : 'Interest removed',
      data: { 
        interests: post.stats.interests,
        isInterested: isInterested,
        interestedUsers: post.interestedUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended posts for user
// @route   GET /api/posts/recommended
// @access  Private
exports.getRecommendedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Get posts based on user's interests
    const filters = {
      status: 'active',
      expiresAt: { $gt: new Date() },
      user: { $ne: req.user.id }, // Exclude user's own posts
    };

    // If user wants to learn, show teaching posts
    if (user.skillsToLearn && user.skillsToLearn.length > 0) {
      filters.type = 'teach';
      filters.skill = { $in: user.skillsToLearn };
    }

    const posts = await Post.find(filters)
      .populate('user', 'name email avatar rating')
      .populate('skill', 'name category')
      .sort({ featured: -1, 'rating.average': -1, 'stats.views': -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending/popular posts
// @route   GET /api/posts/trending
// @access  Public
exports.getTrendingPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .populate('user', 'name email avatar rating')
      .populate('skill', 'name category')
      .sort({ 'stats.views': -1, 'stats.interests': -1, 'rating.average': -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
