const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { uploadImage } = require('../middlewares/upload.middleware');
const { uploadAvatar } = require('../services/cloudinary.service');
const User = require('../models/user.model');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const router = express.Router();

// Configure multer for video/document uploads (100MB limit)
const storage = multer.memoryStorage();
const uploadMedia = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, uploadImage.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadAvatar(req.file.buffer, req.user.id);

    // Update user avatar in database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload course media (video/image/document)
// @route   POST /api/upload/course-media
// @access  Private
router.post('/course-media', protect, uploadMedia.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { resourceType = 'auto' } = req.body;

    console.log('📤 Uploading course media:', {
      fileName: req.file.originalname,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: req.file.mimetype,
      resourceType
    });

    // Upload to Cloudinary via stream (handles large files)
    const streamifier = require('streamifier');
    
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'skilltrade/courses',
          resource_type: resourceType,
          chunk_size: 6000000, // 6MB chunks
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Upload successful:', result.secure_url);
            resolve(result);
          }
        }
      );
      
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration || 0,
        format: result.format,
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    next(error);
  }
});

module.exports = router;
