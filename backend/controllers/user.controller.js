const User = require('../models/user.model');
const { INITIAL_COINS } = require('../config/environment');

// @desc    Register new user with Firebase
// @route   POST /api/users/firebase-register
// @access  Public (but requires Firebase token)
exports.firebaseRegister = async (req, res, next) => {
  try {
    const { firebaseUid, name, email, avatar } = req.body;

    // Check if user already exists
    let user = await User.findOne({ firebaseUid });
    
    if (user) {
      return res.status(200).json({
        success: true,
        data: user,
      });
    }

    // Create new user
    user = await User.create({
      firebaseUid,
      name,
      email,
      avatar,
      coins: INITIAL_COINS || 100,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync Firebase user with backend
// @route   POST /api/users/sync
// @access  Public (but requires Firebase token)
exports.syncUser = async (req, res, next) => {
  try {
    const { firebaseUid, name, email, avatar } = req.body;

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        firebaseUid,
        name,
        email,
        avatar,
        coins: INITIAL_COINS || 100,
      });
    } else {
      // Update existing user info
      user.name = name || user.name;
      user.email = email || user.email;
      user.avatar = avatar || user.avatar;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('skillsToTeach.skillId')
      .populate('skillsToLearn.skillId');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      avatar: req.body.avatar,
      languages: req.body.languages,
      timezone: req.body.timezone,
      availability: req.body.availability,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (for matching)
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .populate('skillsToTeach.skillId')
      .populate('skillsToLearn.skillId');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('skillsToTeach.skillId')
      .populate('skillsToLearn.skillId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
