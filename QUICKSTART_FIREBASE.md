# 🚀 Quick Start with Firebase - SkillTrade

## What's Changed?
✅ **Firebase Authentication** replaces JWT (completely free)  
✅ **Firebase Storage** for avatars & videos (5GB free)  
✅ No credit card needed!

---

## 🔥 Setup Steps (10 minutes)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add Project"**
3. Name it: `skilltrade`
4. Disable Google Analytics (optional)
5. Click **"Create Project"**

### 2. Enable Authentication
1. Click **Build** → **Authentication**
2. Click **"Get Started"**
3. Enable **"Email/Password"**
4. Click **"Save"**

### 3. Skip Storage (Not Needed for Free Plan)
**Note:** Firebase Storage requires the Blaze (paid) plan. We'll use base64 encoding for avatars instead - completely free!

### 4. Get Config for Frontend
1. Go to **Project Settings** (⚙️ icon)
2. Scroll to **"Your apps"**
3. Click **Web icon** `</>`
4. Register app: `SkillTrade Web`
5. Copy the config values
6. Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

### 5. Get Service Account for Backend
1. **Project Settings** → **Service Accounts**
2. Click **"Generate New Private Key"**
3. Click **"Generate Key"** (downloads JSON)
4. Save as `backend/firebase-service-account.json`
5. Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skilltrade
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
```

---

## 📦 Install Dependencies

### Backend
```powershell
cd d:\ignite-skill-trade\backend
npm install
```

### Frontend
```powershell
cd d:\ignite-skill-trade\frontend
npm install
```

---

## ▶️ Run the App

### Terminal 1 - Backend
```powershell
cd d:\ignite-skill-trade\backend
npm run dev
```

Expected output:
```
✅ Firebase Admin initialized
🚀 SkillTrade server running on port 5000
✅ MongoDB Connected
```

### Terminal 2 - Frontend
```powershell
cd d:\ignite-skill-trade\frontend
npm run dev
```

### Terminal 3 - MongoDB
Make sure MongoDB is running!
```powershell
# Check if running
Get-Service MongoDB

# Or start it
net start MongoDB
```

---

## 🧪 Test It!

1. Open http://localhost:3000
2. Click **"Sign Up"**
3. Register with:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
4. You should be redirected to dashboard with **100 coins**! 🎉

---

## 📊 Check Firebase Console

### Authentication
1. Go to Firebase Console → Authentication → Users
2. You should see your test user listed

### MongoDB (when you upload avatar)
1. Avatar is stored as base64 string in MongoDB
2. Check your MongoDB database to see user documents
3. Avatar field will contain base64 encoded image

---

## 🆓 What's Free?

| Service | Free Tier | Enough for MVP? | Credit Card? |
|---------|-----------|-----------------|--------------|
| **Authentication** | 10,000 verifications/month | ✅ Perfect | ❌ No |
| **MongoDB** | 512MB on Atlas Free | ✅ Great | ❌ No |
| **Base64 Images** | Unlimited (in MongoDB) | ✅ Good for MVP | ❌ No |

**For 100-500 users: 100% FREE! No credit card needed!** 🎊

**Note:** Firebase Storage (Blaze plan) is NOT free and requires credit card.

---

## ⚠️ Common Issues

### "Firebase Admin initialization error"
- Check `firebase-service-account.json` exists
- Verify path in `.env` is correct

### "Auth token verification failed"
- Make sure frontend `.env` has correct Firebase config
- Try clearing browser localStorage and logging in again

### "Storage permission denied"
- Check Storage Rules are published
- Make sure user is logged in

---

## 📚 Documentation

Full details: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

## ✨ What's Next?

Now you can:
- ✅ Register & login users (Firebase Auth - FREE)
- ✅ Store user data (MongoDB - FREE)
- ✅ Upload avatars (Base64 - FREE)
- 🚀 Build out remaining features!

**Need more storage later?** Consider:
- Cloudinary (free tier: 25GB)
- ImgBB (free image hosting)
- Firebase Blaze plan (when you have budget)

Happy coding! 🔥
