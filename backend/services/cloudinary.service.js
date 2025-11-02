const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} - Cloudinary response with URL
 */
const uploadToCloudinary = (fileBuffer, folder = 'skilltrade', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Upload avatar image
 * @param {Buffer} fileBuffer - Image buffer
 * @param {String} userId - User ID
 * @returns {Promise<String>} - Image URL
 */
exports.uploadAvatar = async (fileBuffer, userId) => {
  try {
    const result = await uploadToCloudinary(
      fileBuffer,
      `skilltrade/avatars/${userId}`,
      'image'
    );
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload avatar');
  }
};

/**
 * Upload video
 * @param {Buffer} fileBuffer - Video buffer
 * @param {String} tradeId - Trade ID
 * @returns {Promise<String>} - Video URL
 */
exports.uploadVideo = async (fileBuffer, tradeId) => {
  try {
    const result = await uploadToCloudinary(
      fileBuffer,
      `skilltrade/videos/${tradeId}`,
      'video'
    );
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload video');
  }
};

/**
 * Upload audio file
 * @param {Buffer} audioBuffer - Audio buffer
 * @returns {Promise<Object>} - Cloudinary response with URL
 */
exports.uploadAudio = async (audioBuffer) => {
  try {
    const result = await uploadToCloudinary(
      audioBuffer,
      'skilltrade/audio/dubbed',
      'video' // Cloudinary uses 'video' resource type for audio
    );
    return result;
  } catch (error) {
    console.error('Cloudinary audio upload error:', error);
    throw new Error('Failed to upload audio');
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - 'image' or 'video'
 */
exports.deleteFile = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Get public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
exports.getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  const folder = parts.slice(parts.indexOf('skilltrade'), -1).join('/');
  return `${folder}/${publicId}`;
};
