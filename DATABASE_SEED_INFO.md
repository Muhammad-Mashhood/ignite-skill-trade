# Database Seed Information

## ✅ Database Successfully Populated!

The database has been seeded with realistic dummy data:
- **20 Skills** (JavaScript, Python, React, UI/UX Design, Digital Marketing, etc.)
- **12 Users** (with varying skills to teach and learn)
- **25 Posts** (trade skill posts with different combinations)
- **15 Proposals** (various statuses: pending, accepted, rejected)

## 🔑 Login Credentials

### Important Note About Authentication
The dummy users in MongoDB have **dummy Firebase UIDs** that don't correspond to real Firebase accounts. This means you **cannot** directly login with these credentials through the normal Firebase authentication flow.

### How to Use the Seeded Data

#### Option 1: Register New Account (Recommended)
1. Go to the frontend and **register a new account** normally through Firebase
2. Your new account will automatically appear in MongoDB
3. All the seeded posts from other users will be visible to you
4. You can create your own posts and interact with existing ones

#### Option 2: Create Script to Link Firebase User
Create Firebase users that match the MongoDB users (requires Firebase Admin SDK setup).

## 📊 Seeded Users Overview

### Emails Created:
1. dummymash1@gmail.com - Dummymash One (Web developer)
2. dummymash2@gmail.com - Dummymash Two (Graphic designer)
3. dummymash3@gmail.com - Dummymash Three (Data scientist)
4. dummymash4@gmail.com - Dummymash Four (Mobile app developer)
5. dummymash5@gmail.com - Dummymash Five (Digital marketing expert)
6. dummymash6@gmail.com - Dummymash Six (UI/UX designer)
7. dummymash7@gmail.com - Dummymash Seven (Backend engineer)
8. dummymash8@gmail.com - Dummymash Eight (Video editor)
9. dummymash9@gmail.com - Dummymash Nine (Business analyst)
10. dummymash10@gmail.com - Dummymash Ten (Photographer)
11. dummymash11@gmail.com - Dummymash Eleven (DevOps engineer)
12. dummymash12@gmail.com - Dummymash Twelve (Content writer)

**Password for all:** `test_seed_password_123`

> ⚠️ **Note**: This is test data for development purposes only. Never use these credentials in production. Change the password in `backend/seed-database.js` if deploying.

## 🎯 What Each User Has

Each user has been configured with:
- **Skills to Teach**: 1-3 random skills from the catalog
- **Skills to Learn**: 1-4 different skills they want to learn
- **Coins**: Random amount between 100-400
- **Rating**: 3.0 to 5.0 stars
- **Level**: 1-5
- **Verification Status**: 70% are verified
- **Completed Sessions**: 0-30 sessions

## 📝 Sample Posts Created

Posts include combinations like:
- "Looking to trade web development skills for design help"
- "Experienced Python developer seeking JavaScript mentor"
- "Teach you graphic design in exchange for marketing tips"
- "React expert willing to trade for Node.js knowledge"
- And 21 more...

Each post has:
- User who created it
- Skills they will teach
- Skills they want to learn
- Description with experience details
- Duration (30, 45, 60, or 90 minutes)
- Availability schedule
- Stats (views, interests, shares)
- Active status (expires in 30 days)

## 💬 Sample Proposals Created

15 proposals have been created between users including:
- Trade proposals (offering skills in exchange)
- Chat requests (just want to talk)
- Various statuses (pending, accepted, rejected)

## 🚀 Testing the Application

### Step 1: Start Backend
```bash
cd backend
node server.js
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Register & Explore
1. Register a new account with your email
2. Navigate to **Feed** - see personalized recommendations
3. Go to **Posts** - browse all 25 dummy posts
4. Click on any post to view details
5. Send proposals to other users' posts
6. Check **Proposals** to see interactions

## 🔄 Re-seeding the Database

If you want to reset and re-seed:

```bash
cd backend
node seed-database.js
```

This will:
1. Clear all existing data
2. Create fresh skills, users, posts, and proposals
3. Show a summary of created items

## 🛠 Troubleshooting

### Posts Not Showing?
- **Check if backend is running** on port 5000
- **Open browser console** to see API errors
- **Verify you're logged in** (check AuthContext)
- **Check network tab** to see if API calls are made

### Cannot Login with Dummy Accounts?
- This is expected! The dummy accounts don't have Firebase authentication
- **Solution**: Register a new account through the app
- Your account will see all the dummy posts and can interact with them

### Need to Access Dummy User Posts?
- The posts are tied to dummy users
- When you're logged in as a real user, you'll see all their posts
- You can create proposals to interact with dummy user posts

## 📌 Important Notes

1. **Firebase UIDs are dummy** - Don't match real Firebase accounts
2. **Posts are visible to all users** - Your new account will see them
3. **Proposals link dummy users** - You can interact with their posts
4. **Skills are shared** - All users reference the same skill catalog
5. **Availability is preset** - Monday, Wednesday, Friday with time slots

## 🎨 What to Test

- [x] Feed page with personalized algorithm
- [x] Posts page showing all trade posts
- [x] Post detail with skills displayed
- [x] Creating new posts (your account)
- [x] Sending proposals to dummy users
- [x] Viewing received proposals (if dummy users propose to you)
- [x] Profile with skills to teach/learn
- [x] Matching algorithm
- [x] Search and filters

Enjoy testing your SkillTrade platform! 🚀
