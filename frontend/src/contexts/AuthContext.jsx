import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserProfile, getUserProfile, syncFirebaseUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get Firebase ID token
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          localStorage.setItem('token', token);
          console.log('✅ Token saved to localStorage');

          // Sync with backend and get full user profile
          const userData = await syncFirebaseUser(firebaseUser.uid, {
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL || '',
          });
          setUser(userData);
          console.log('✅ User synced with backend:', userData.name, '-', userData.coins, 'coins');
        } catch (error) {
          console.error('❌ Error syncing user with backend:', error);
          
          // If backend sync fails, create a minimal user object from Firebase data
          // This allows the user to stay logged in even if backend is temporarily unavailable
          const fallbackUser = {
            _id: null, // Will be synced later
            firebaseUid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL || '',
            coins: 0, // Default value
            rating: { average: 0, count: 0 },
          };
          setUser(fallbackUser);
          console.warn('⚠️ Using fallback user data, backend sync failed');
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIdToken(null);
        localStorage.removeItem('token');
        console.log('🚪 User logged out, cleared all state');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register new user
  const register = async (name, email, password) => {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Get ID token
      const token = await userCredential.user.getIdToken();
      
      // Create user profile in backend
      const userData = await createUserProfile({
        firebaseUid: userCredential.user.uid,
        name,
        email,
        avatar: userCredential.user.photoURL || '',
      }, token);

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      // Transform Firebase error codes to user-friendly messages
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      const friendlyError = new Error(errorMessage);
      friendlyError.code = error.code;
      throw friendlyError;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Wait for backend sync to complete
      const token = await userCredential.user.getIdToken();
      const userData = await syncFirebaseUser(userCredential.user.uid, {
        name: userCredential.user.displayName || userCredential.user.email.split('@')[0],
        email: userCredential.user.email,
        avatar: userCredential.user.photoURL || '',
      });
      
      // Manually set user state to ensure immediate update
      setUser(userData);
      setFirebaseUser(userCredential.user);
      setIdToken(token);
      localStorage.setItem('token', token);
      
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      // Transform Firebase error codes to user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      const friendlyError = new Error(errorMessage);
      friendlyError.code = error.code;
      throw friendlyError;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      setIdToken(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Refresh user data from backend
  const refreshUser = async () => {
    try {
      if (firebaseUser) {
        console.log('🔄 Refreshing user data from backend...');
        const userData = await syncFirebaseUser(firebaseUser.uid, {
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || '',
        });
        setUser(userData);
        console.log('✅ User data refreshed:', userData.coins, 'coins');
        return userData;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  // Refresh ID token
  const refreshToken = async () => {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken(true);
      setIdToken(token);
      localStorage.setItem('token', token);
      return token;
    }
    return null;
  };

  const value = {
    user,
    firebaseUser,
    idToken,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    refreshToken,
    isAuthenticated: !!user && !!firebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
