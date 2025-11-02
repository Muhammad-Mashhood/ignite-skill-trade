# MongoDB Atlas Quick Setup Guide

## 🎯 What You Need: Connection String

You need to get your **MongoDB Connection String** and add it to your `backend/.env` file.

---

## 📋 Step-by-Step Instructions

### 1. **Go to MongoDB Atlas Dashboard**
Open: [https://cloud.mongodb.com](https://cloud.mongodb.com)

### 2. **Click "Connect" Button**
- Find your cluster (should show as "Cluster0" or similar)
- Click the **"Connect"** button

### 3. **Choose Connection Method**
Select: **"Connect your application"**

### 4. **Copy Connection String**
You'll see a string like this:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5. **Modify the Connection String**

Replace `<username>` and `<password>` with your actual credentials, and add the database name:

**Original:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Modified (example):**
```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/skilltrade?retryWrites=true&w=majority
```

**Key changes:**
- Replace `<username>` with your MongoDB username
- Replace `<password>` with your MongoDB password
- Add `/skilltrade` after `.mongodb.net/` (database name)

---

## 🔐 If You Don't Remember Your Password

### Create a New Database User:

1. In MongoDB Atlas, go to **Database Access** (left sidebar)
2. Click **"+ ADD NEW DATABASE USER"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `skilltrade-user`)
5. Click **"Autogenerate Secure Password"** or create your own
6. **IMPORTANT**: Copy the password immediately!
7. Set **Database User Privileges**: Select **"Read and write to any database"**
8. Click **"Add User"**

---

## 🌐 Whitelist Your IP Address

For security, MongoDB requires you to whitelist IP addresses:

1. Go to **Network Access** (left sidebar)
2. Click **"+ ADD IP ADDRESS"**
3. Choose one of these options:

   **Option A: Allow All IPs** (easiest for development)
   - Click **"ALLOW ACCESS FROM ANYWHERE"**
   - This adds `0.0.0.0/0`
   - ⚠️ Less secure, but fine for MVP

   **Option B: Add Your Current IP** (more secure)
   - Click **"ADD CURRENT IP ADDRESS"**
   - Your local IP will be added automatically

4. Click **"Confirm"**

---

## ✏️ Add to Your .env File

1. Open: `d:\ignite-skill-trade\backend\.env`

2. Find the line:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   ```

3. Replace it with your connection string:
   ```
   MONGODB_URI=mongodb+srv://skilltrade-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/skilltrade?retryWrites=true&w=majority
   ```

4. Save the file

---

## 🧪 Test Your Connection

Run this command to test:

```powershell
cd d:\ignite-skill-trade\backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB Connected!')).catch(err => console.error('❌ Error:', err.message));"
```

**Expected Output:**
```
✅ MongoDB Connected!
```

---

## 🐛 Common Issues

### Issue: "Authentication failed"
**Solution**: Double-check username and password in connection string

### Issue: "IP not whitelisted"
**Solution**: Add `0.0.0.0/0` in Network Access

### Issue: "Could not connect to any servers"
**Solution**: Check your internet connection and firewall settings

### Issue: "Invalid connection string"
**Solution**: Make sure you:
- Replaced `<username>` and `<password>`
- Added `/skilltrade` database name
- No spaces in the connection string

---

## 📝 Quick Checklist

- [ ] Copied connection string from MongoDB Atlas
- [ ] Replaced `<username>` with your MongoDB username
- [ ] Replaced `<password>` with your MongoDB password  
- [ ] Added `/skilltrade` database name
- [ ] Added connection string to `backend/.env`
- [ ] Whitelisted IP address (0.0.0.0/0 or your IP)
- [ ] Tested connection successfully

---

## 🎯 Example .env Configuration

Your `backend/.env` should look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://skilltrade-user:MySecurePass123@cluster0.abc123.mongodb.net/skilltrade?retryWrites=true&w=majority

# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# JWT Secret
JWT_SECRET=your_random_secret_key_here_change_this
```

---

## ✅ You're Done!

Once you add the MongoDB connection string, your backend will be fully configured and ready to run! 🚀
