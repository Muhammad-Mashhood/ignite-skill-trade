require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const { uploadAvatar } = require('./services/cloudinary.service');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Cloudinary Upload Service...\n');

// Create a simple test image buffer (1x1 pixel PNG)
const testImageBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

console.log('📤 Uploading test image to Cloudinary...');

uploadAvatar(testImageBuffer, 'test-user-123')
  .then(imageUrl => {
    console.log('\n✅ Upload Successful!');
    console.log('🔗 Image URL:', imageUrl);
    console.log('\n✨ Cloudinary upload service is working perfectly!');
    console.log('\n📝 Note: You can view this image in your Cloudinary dashboard:');
    console.log('   https://cloudinary.com/console/media_library');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Upload Failed!');
    console.error('Error:', error.message);
    process.exit(1);
  });
