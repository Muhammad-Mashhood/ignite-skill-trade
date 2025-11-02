const express = require('express');
const {
  firebaseRegister,
  syncUser,
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Firebase auth routes
router.post('/firebase-register', firebaseRegister);
router.post('/sync', syncUser);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);

module.exports = router;
