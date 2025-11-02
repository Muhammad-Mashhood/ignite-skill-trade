const admin = require('../config/firebase-admin');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Has authorization header:', !!req.headers.authorization);
  console.log('Token present:', !!token);

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('✅ Token verified. Firebase UID:', decodedToken.uid);
    
    // Find user in database by Firebase UID
    req.user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');
    
    if (!req.user) {
      console.log('❌ User not found in database for Firebase UID:', decodedToken.uid);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ User found:', req.user._id);
    req.user.id = req.user._id.toString(); // Add id property for compatibility
    req.firebaseUid = decodedToken.uid;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // No token, continue without user
    return next();
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find user in database by Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');
    
    if (user) {
      req.user = user;
      req.user.id = user._id.toString(); // Add id for compatibility
      req.firebaseUid = decodedToken.uid;
    }
    
    next();
  } catch (error) {
    // Token invalid, but we don't fail - just continue without user
    console.log('Optional auth failed, continuing without user');
    next();
  }
};
