import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Your web app's Firebase configuration
// Get these values from Firebase Console -> Project Settings -> General
const firebaseConfig = {
  apiKey: "AIzaSyATo7Rgo4FAnyq7OG55Dq-NLCZUfPRHD9Q",
  authDomain: "ignite-skill-trade.firebaseapp.com",
  projectId: "ignite-skill-trade",
  storageBucket: "ignite-skill-trade.firebasestorage.app",
  messagingSenderId: "1058602599737",
  appId: "1:1058602599737:web:59e670e6f65a72635754e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence to LOCAL (persists even when browser is closed)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase persistence enabled');
  })
  .catch((error) => {
    console.error('❌ Firebase persistence error:', error);
  });

export default app;
