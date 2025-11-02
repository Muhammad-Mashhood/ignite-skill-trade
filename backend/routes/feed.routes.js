const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// GET /api/feed - Get personalized feed with pagination
router.get('/', feedController.getPersonalizedFeed);

// GET /api/feed/trending - Get trending posts
router.get('/trending', feedController.getTrendingPosts);

// GET /api/feed/recent - Get recent posts (fallback)
router.get('/recent', feedController.getRecentPosts);

module.exports = router;
