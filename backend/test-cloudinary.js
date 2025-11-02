require('dotenv').config();
const cloudinary = require('./config/cloudinary');

console.log('🧪 Testing Cloudinary Configuration...\n');

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Not Set');

// Test Cloudinary connection by pinging the API
cloudinary.api.ping()
  .then(result => {
    console.log('\n✅ Cloudinary Connection Successful!');
    console.log('Status:', result.status);
    console.log('\n🎉 Your Cloudinary is configured and working!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Cloudinary Connection Failed!');
    console.error('Error:', error.message);
    process.exit(1);
  });
