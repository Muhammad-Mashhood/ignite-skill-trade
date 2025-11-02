const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  // Check if we have the required environment variables
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_PRIVATE_KEY && 
      process.env.FIREBASE_CLIENT_EMAIL) {
    
    // Initialize with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️ Firebase credentials not found in .env file');
    console.warn('   Authentication features will not work');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
}

module.exports = admin;
