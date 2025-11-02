# 🔥 Firebase Setup Guide for SkillTrade

## Overview
Your SkillTrade project uses **Firebase Authentication** (100% FREE on Spark Plan - no credit card needed!).

**Note:** Firebase Storage requires the Blaze (pay-as-you-go) plan. For the MVP, we'll use alternative free solutions for file storage.

---

## 📋 What's Included (Free on Spark Plan)

### ✅ Firebase Authentication (FREE)
- ✅ Email/Password authentication
- ✅ 10,000 verifications/month
- ✅ Social login support (Google, Facebook, etc.)
- ✅ **NO CREDIT CARD REQUIRED**

### ❌ Firebase Storage (NOT FREE)
- ❌ Requires Blaze (pay-as-you-go) plan
- ❌ Needs credit card (though starts free)

### 💡 Alternative Free Storage Options for MVP:
1. **Base64 encoding** (for small avatars) - Built-in
2. **Cloudinary** - Free tier: 25GB storage, 25GB bandwidth/month
3. **ImgBB** - Free image hosting with API
4. **Uploadcare** - Free tier: 3000 uploads/month
5. **Local storage** - For development only

---

## 🚀 Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `skilltrade` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

### Step 3: Get Firebase Config (Frontend)

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register app with nickname: "SkillTrade Web"
5. Copy the `firebaseConfig` object
6. Create `.env` file in `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 4: Get Service Account Key (Backend)

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click "Generate New Private Key"
3. Click "Generate Key" (downloads JSON file)
4. Save the file as `firebase-service-account.json` in `backend/` folder
5. **⚠️ IMPORTANT:** Add to `.gitignore` (already done)
6. Create `.env` file in `backend/` folder:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skilltrade

# Point to your service account file
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
```

---

## 📦 Installation

### Frontend
```powershell
cd frontend
npm install
```

### Backend
```powershell
cd backend
npm install
```

---

## 🏃‍♂️ Running the Application

### 1. Start Backend
```powershell
cd backend
npm run dev
```

You should see:
```
✅ Firebase Admin initialized
🚀 SkillTrade server running on port 5000
✅ MongoDB Connected: ...
```

### 2. Start Frontend
```powershell
cd frontend
npm run dev
```

---

## 🎯 How It Works

### Authentication Flow

1. **User Registers:**
   - Frontend creates Firebase user
   - Gets Firebase ID token
   - Sends token to backend
   - Backend verifies token and creates MongoDB user profile

2. **User Logs In:**
   - Frontend authenticates with Firebase
   - Gets ID token automatically
   - Backend verifies token on each API request

3. **Protected Routes:**
   - Frontend stores ID token in localStorage
   - Sends token in Authorization header
   - Backend middleware verifies token with Firebase Admin SDK

### File Storage Flow (MVP Solution)

For the MVP, we use **base64 encoding** for small images like avatars:

```javascript
import { uploadAvatar } from './utils/storage';

const handleAvatarUpload = async (file, userId) => {
  // Converts image to base64 string
  const base64String = await uploadAvatar(file, userId);
  // Save base64String to user profile in MongoDB
};
```

**For production**, consider upgrading to:
- Cloudinary (recommended - free tier is generous)
- Firebase Storage (requires Blaze plan)
- AWS S3 (requires AWS account)

---

## 🆓 Free Tier Limits (Spark Plan)

### ✅ Authentication (100% FREE)
- ✅ **10,000 verifications/month** (perfect for MVP)
- ✅ **Unlimited users**
- ✅ **NO CREDIT CARD REQUIRED**

### ❌ Storage (Requires Blaze Plan)
- ❌ Not available on free Spark plan
- ❌ Requires credit card to upgrade

### 💡 For MVP, We Use:
- **Base64 encoding** for avatars (stored in MongoDB)
- **External URLs** for profile pictures
- **Estimated storage:** ~100KB per user in MongoDB (very efficient!)

---

## 🔒 Security Best Practices

### ✅ Already Implemented
- Firebase Admin SDK for backend verification
- Security rules for Storage
- ID token validation on each request
- Separate Firebase UID and MongoDB user ID

### 🛡️ Additional Security
1. **Enable App Check** (prevents abuse)
2. **Set up CORS** properly in production
3. **Rate limiting** for API endpoints
4. **Email verification** for new users

---

## 📝 Testing

### Test Authentication
1. Register new user at `http://localhost:3000/register`
2. Check Firebase Console → Authentication → Users
3. Login with registered user
4. Check if you can access dashboard

### Test Avatar Upload (coming soon in Profile page)
1. Upload avatar image (max 2MB)
2. Image converts to base64 and saves to MongoDB
3. Verify image appears in your profile

---

## 🚨 Troubleshooting

### Error: "Firebase Admin initialization error"
- Make sure `firebase-service-account.json` exists
- Check `.env` has correct path
- Verify JSON file is valid

### Error: "File too large"
- Avatars are limited to 2MB for base64 storage
- Consider using external image hosting services
- Or upgrade to a paid storage solution

### Error: "Auth token verification failed"
- Check if Firebase config is correct in frontend `.env`
- Make sure service account key is correct
- Try refreshing the ID token

---

## 🎉 You're All Set!

Now your app uses:
- ✅ Firebase Authentication (100% free, no credit card)
- ✅ MongoDB for user profiles and data
- ✅ Base64 encoding for small images
- ✅ Secure backend validation

**Completely free for MVP!** 🎊

## 💡 When to Upgrade Storage

Consider paid storage when:
- You have 100+ active users uploading content
- Users need to upload videos
- You want faster loading times for images
- You exceed MongoDB document size limits (16MB)

**Recommended:** [Cloudinary](https://cloudinary.com) - Free tier is very generous!
