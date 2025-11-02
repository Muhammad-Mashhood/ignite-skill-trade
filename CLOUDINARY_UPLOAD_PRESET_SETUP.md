# Cloudinary Upload Preset Setup Guide

## Issue
Course upload fails with: `Upload failed with status 400. Please check your Cloudinary upload preset "skilltrade" is configured correctly.`

## Solution: Create Upload Preset in Cloudinary

### Step 1: Log into Cloudinary
1. Go to https://cloudinary.com
2. Sign in to your Cloudinary account

### Step 2: Create Upload Preset
1. Click on **Settings** (gear icon in top right)
2. Navigate to **Upload** tab on the left sidebar
3. Scroll down to **Upload presets** section
4. Click **Add upload preset** button

### Step 3: Configure the Preset
Fill in the following settings:

**Preset name:** `skilltrade`

**Signing mode:** Select **"Unsigned"** (this allows uploads without authentication)

**Folder:** (optional) You can set a folder like `courses/` to organize uploads

**Upload Manipulations:**
- **Allowed formats:** Leave default or set to: `jpg, png, gif, webp, mp4, mov, pdf, doc, docx`
- **Max file size:** Set appropriate limits (e.g., 100 MB for videos)

**Responsive Breakpoints:** Leave default (optional optimization)

**Eager transformations:** Leave empty for now

### Step 4: Save
1. Click **Save** at the bottom
2. The preset name `skilltrade` should now appear in your list

### Step 5: Verify in Code
The upload code is already configured to use this preset:
```javascript
formData.append('upload_preset', 'skilltrade');
```

### Step 6: Test Upload
1. Go to Create Course page
2. Fill in course details
3. Add thumbnail/videos/documents
4. Click "Publish Course"
5. Check browser console for:
   - `📤 Uploading to Cloudinary: { fileName, resourceType, cloudName }`
   - `✅ Upload successful: https://res.cloudinary.com/...`

## Alternative: Use Backend Upload Route (Already Implemented)

Instead of direct Cloudinary uploads from frontend, you can use the backend upload route which is already set up:

### Backend Upload Endpoint: `POST /api/upload`
This endpoint handles Cloudinary uploads server-side with proper authentication.

To use it, modify CreateCoursePage uploadToCloudinary function to call the backend API:

```javascript
const uploadToCloudinary = async (file, resourceType = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('resourceType', resourceType);
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  const data = await response.json();
  return {
    url: data.url,
    publicId: data.publicId,
    duration: data.duration || 0
  };
};
```

## Current Status
✅ Frontend .env configured with Cloudinary cloud name
✅ Frontend server restarted to load env variable
✅ Better error messages added to show Cloudinary issues
⏳ Waiting for upload preset `skilltrade` to be created in Cloudinary

## Quick Test After Setup
1. Create a simple course with just a thumbnail
2. Check if upload succeeds
3. Then try with videos and documents

## Troubleshooting

### Error: "Upload preset not found"
- Double-check the preset name is exactly `skilltrade` (lowercase, no spaces)
- Ensure "Unsigned" mode is selected
- Wait a few seconds after saving for changes to propagate

### Error: "Invalid signature"
- This means you have "Signed" mode enabled
- Change to "Unsigned" mode in preset settings

### Error: "File too large"
- Increase max file size in preset settings
- Or split videos into smaller chunks

### Error: "Invalid format"
- Add the file extension to allowed formats in preset
- Common formats: jpg, png, mp4, pdf

## Need Help?
Check Cloudinary logs at: https://cloudinary.com/console/logs
