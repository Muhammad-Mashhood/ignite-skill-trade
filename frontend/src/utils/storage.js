/**
 * FILE STORAGE UTILITIES
 * 
 * Note: Firebase Storage requires Blaze (paid) plan.
 * For MVP, we'll use:
 * 1. Local file storage (for development)
 * 2. Base64 encoding for small images
 * 3. External URLs
 * 
 * For production, consider:
 * - Cloudinary (free tier: 25GB storage, 25GB bandwidth)
 * - ImgBB (free image hosting)
 * - Uploadcare (free tier: 3000 uploads/month)
 * - Or upgrade to Firebase Blaze plan when ready
 */

/**
 * Convert file to base64 (for avatars - small images only)
 * @param {File} file - Image file
 * @returns {Promise<String>} - Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Upload user avatar (converts to base64 for now)
 * @param {File} file - Image file
 * @param {String} userId - User ID
 * @returns {Promise<String>} - Base64 string
 */
export const uploadAvatar = async (file, userId) => {
  // Validate image
  const validation = validateImage(file, 2); // Max 2MB for avatars
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Convert to base64
  return await fileToBase64(file);
};

/**
 * Upload from URL (for external images)
 * @param {String} url - Image URL
 * @returns {Promise<String>} - Returns the URL
 */
export const uploadFromUrl = async (url) => {
  // For now, just validate and return the URL
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return url;
    }
    throw new Error('Invalid URL');
  } catch (error) {
    throw new Error('Failed to validate URL');
  }
};

/**
 * Get file size in MB
 * @param {File} file - File object
 * @returns {Number} - Size in MB
 */
export const getFileSizeMB = (file) => {
  return (file.size / (1024 * 1024)).toFixed(2);
};

/**
 * Validate file type
 * @param {File} file - File object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {Boolean}
 */
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate image file
 * @param {File} file - File object
 * @param {Number} maxSizeMB - Maximum size in MB
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImage = (file, maxSizeMB = 5) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validateFileType(file, allowedTypes)) {
    return { valid: false, error: 'Please upload a valid image file (JPEG, PNG, GIF, WebP)' };
  }
  
  if (getFileSizeMB(file) > maxSizeMB) {
    return { valid: false, error: `Image size must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true, error: null };
};

/**
 * Validate video file
 * @param {File} file - File object
 * @param {Number} maxSizeMB - Maximum size in MB
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateVideo = (file, maxSizeMB = 100) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  
  if (!validateFileType(file, allowedTypes)) {
    return { valid: false, error: 'Please upload a valid video file (MP4, WebM, OGG)' };
  }
  
  if (getFileSizeMB(file) > maxSizeMB) {
    return { valid: false, error: `Video size must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true, error: null };
};
