const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  markInterest,
  getRecommendedPosts,
  getTrendingPosts,
} = require('../controllers/post.controller');
const { protect, optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes first (specific paths before /:id)
router.get('/my/posts', protect, getMyPosts);
router.get('/debug/all', protect, async (req, res) => {
  try {
    const Post = require('../models/post.model');
    const allPosts = await Post.find({}).populate('user', 'name email firebaseUid');
    res.json({
      success: true,
      currentUserId: req.user._id.toString(),
      currentUserFirebaseUid: req.user.firebaseUid,
      totalPosts: allPosts.length,
      posts: allPosts.map(p => ({
        _id: p._id,
        title: p.title,
        userId: p.user?._id?.toString(),
        userEmail: p.user?.email,
        userFirebaseUid: p.user?.firebaseUid,
        matchesCurrentUser: p.user?._id?.toString() === req.user._id.toString()
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/recommended/for-me', protect, getRecommendedPosts);
router.get('/trending', getTrendingPosts);

// Public routes with optional auth
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);

// Protected CRUD routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/interest', protect, markInterest);

module.exports = router;
