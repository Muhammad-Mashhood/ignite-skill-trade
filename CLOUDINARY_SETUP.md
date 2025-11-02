# Cloudinary Setup Guide for SkillTrade

## ✅ What You Need

Your Cloudinary account should be configured with:
- **Cloud Name**: `your_cloud_name_here`
- **API Key**: `your_api_key_here`
- **API Secret**: `your_api_secret_here`

Add these credentials to your `backend/.env` file.

---

## 📋 Cloudinary Dashboard - Optional Settings

### 1. **Media Library Settings** (Optional)
Navigate to: **Settings → Upload**

**Recommended Settings:**
- ✅ **Upload Presets**: Use the default `unsigned` preset (already enabled)
- ✅ **File Size Limit**: Keep default (10MB for free tier)
- ✅ **Allowed Formats**: 
  - For avatars: jpg, png, gif, webp
  - For videos: mp4, webm, mov

**To Create Custom Upload Preset (Optional):**
1. Go to **Settings → Upload → Add upload preset**
2. Name it: `skilltrade-avatars`
3. Set **Signing Mode**: Signed
4. **Folder**: `skilltrade/avatars`
5. **Access Mode**: Public
6. **Allowed formats**: jpg, png, gif, webp
7. Click **Save**

### 2. **Security Settings** (Recommended)
Navigate to: **Settings → Security**

**Check these settings:**
- ✅ **Allowed fetch domains**: Add your frontend domain when deployed (e.g., `yourdomain.com`)
- ✅ **Restricted media types**: Leave as default
- ⚠️ **API Environment variable**: Your `CLOUDINARY_URL` is already in `.env` file

### 3. **Usage Monitoring** (Important)
Navigate to: **Dashboard → Usage**

**Free Tier Limits:**
- ✅ **Storage**: 25 GB
- ✅ **Bandwidth**: 25 GB/month
- ✅ **Transformations**: 25,000/month
- ✅ **Video**: 500 seconds of video storage

**Monitor your usage regularly to avoid hitting limits.**

---

## 🧪 Testing Cloudinary Integration

### Test 1: Check Configuration
Run this in your backend directory:

```powershell
cd d:\ignite-skill-trade\backend
node -e "require('dotenv').config(); console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME); console.log('API Key:', process.env.CLOUDINARY_API_KEY)"
```

**Expected Output:**
```
Cloud Name: your_cloud_name_here
API Key: your_api_key_here
```

### Test 2: Test Upload Endpoint
After starting your backend server:

```powershell
# Start the backend server
cd d:\ignite-skill-trade\backend
npm run dev
```

Then use a tool like **Postman** or **Thunder Client** in VS Code:

**Endpoint**: `POST http://localhost:5000/api/upload/avatar`

**Headers**:
- `Authorization`: `Bearer <your_firebase_token>`
- `Content-Type`: `multipart/form-data`

**Body** (form-data):
- Key: `avatar`
- Type: File
- Value: Select any image file

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/your_cloud_name/image/upload/v.../skilltrade/avatars/...",
    "user": { ... }
  }
}
```

### Test 3: Verify in Cloudinary Dashboard
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console/media_library)
2. Navigate to **Media Library**
3. Look for folder: `skilltrade/avatars/`
4. You should see your uploaded test image

---

## 🔧 Cloudinary Features Used in SkillTrade

### 1. **Avatar Uploads** (`/api/upload/avatar`)
- **Folder**: `skilltrade/avatars/{userId}`
- **Type**: Images (jpg, png, gif, webp)
- **Size Limit**: 5MB
- **Auto-generated URL**: Returned to frontend and saved in user profile

### 2. **Video Uploads** (Future Feature)
- **Folder**: `skilltrade/videos/{tradeId}`
- **Type**: Videos (mp4, webm, mov)
- **Size Limit**: 100MB
- **Use Case**: Session recordings, skill demos

### 3. **Transformations** (Automatic)
Cloudinary can automatically optimize images:
- Resize avatars to consistent dimensions
- Convert to WebP for better performance
- Apply compression

**Example transformed URL:**
```
https://res.cloudinary.com/your_cloud_name/image/upload/w_200,h_200,c_fill/skilltrade/avatars/...
```

---

## 🚀 What's Already Configured

✅ **Backend Files Ready:**
- `config/cloudinary.js` - Cloudinary SDK configuration
- `services/cloudinary.service.js` - Upload/delete functions
- `middlewares/upload.middleware.js` - Multer file handling
- `routes/upload.routes.js` - Upload endpoints
- `server.js` - Upload routes integrated

✅ **Environment Variables Set:**
- All Cloudinary credentials in `backend/.env`

✅ **Dependencies Installed:**
- `cloudinary` - Official Cloudinary SDK
- `multer` - File upload middleware
- `streamifier` - Stream handling for uploads

---

## ❓ Do You Need to Do Anything Else?

### In Cloudinary Dashboard: **NO** ✅
Your credentials are already working. The default settings are fine for MVP.

### Optional Improvements:
1. **Enable 2FA** (Settings → Security → Two-Factor Authentication)
2. **Add your email** for usage alerts (Settings → Account → Email Notifications)
3. **Bookmark Media Library** for easy access to uploaded files

---

## 🐛 Troubleshooting

### Issue: "Invalid API Key"
**Solution**: Double-check your `.env` file has the correct credentials (no extra spaces).

### Issue: "Upload failed"
**Solution**: 
1. Check file size is under 5MB for images
2. Verify file format is supported (jpg, png, gif, webp)
3. Check Cloudinary dashboard for error logs

### Issue: "Cannot find folder in Media Library"
**Solution**: Folders are created automatically on first upload. Upload a test file first.

### Issue: "Rate limit exceeded"
**Solution**: Free tier has limits. Check **Dashboard → Usage** and upgrade if needed.

---

## 📚 Next Steps

1. ✅ Start backend server: `npm run dev` (in `backend/` directory)
2. ✅ Start frontend server: `npm run dev` (in `frontend/` directory)
3. ✅ Test avatar upload from Profile Page
4. ✅ Check uploaded files in Cloudinary Media Library

**Your Cloudinary integration is ready to use!** 🎉
