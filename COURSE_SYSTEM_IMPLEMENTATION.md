# Course System Implementation - Complete Guide

## ✅ COMPLETED: Backend Infrastructure

### 1. Database Model (Course Model)
**File:** `backend/models/course.model.js`

**Key Features:**
- Full course structure with videos, documents, thumbnail
- Enrollment tracking with progress
- Rating and review system
- Access control based on completed trades
- Urdu dubbing support for videos
- Stats: views, enrollments, ratings

**Schema Fields:**
- `title`, `description`, `thumbnail`
- `instructor` (ref to User)
- `skills` (array of Skill refs)
- `price`, `coinsRequired` (for access)
- `videos[]` - title, url, duration, hasDubbing, dubbedAudioUrl
- `documents[]` - title, url, fileType, fileSize
- `enrollments[]` - user, progress, completedVideos
- `stats` - views, enrollmentCount, averageRating
- `isPublished`, `isDraft`

**Methods:**
- `hasAccess(userId)` - Check if user completed trade with instructor
- `enrollUser(userId)` - Enroll user in course
- `getAccessibleCourses(userId, instructorId)` - Get courses user can access

### 2. Course Controller
**File:** `backend/controllers/course.controller.js`

**Endpoints:**
1. `POST /api/courses` - Create course
2. `GET /api/courses` - Get all published courses (with filters)
3. `GET /api/courses/:id` - Get single course (locks content if no access)
4. `GET /api/courses/my/created` - Get user's created courses
5. `GET /api/courses/instructor/:userId` - Get instructor's courses with access check
6. `PUT /api/courses/:id` - Update course (instructor only)
7. `DELETE /api/courses/:id` - Delete course (instructor only)
8. `POST /api/courses/:id/enroll` - Enroll in course
9. `POST /api/courses/:id/rate` - Rate course
10. `PUT /api/courses/:id/publish` - Publish/unpublish course
11. `POST /api/courses/:id/videos/:videoId/dub` - Generate Urdu dubbing

**Access Control:**
- Videos and documents URLs hidden if user hasn't completed trade with instructor
- Only instructor can edit/delete their courses
- Enrollment requires completed trade

### 3. ElevenLabs Integration
**File:** `backend/services/ai-dubbing.service.js`

**Features:**
- `generateUrduDubbing(text, voiceId)` - Generate Urdu audio using ElevenLabs
- `getAvailableVoices()` - List ElevenLabs voices
- `translateToUrdu(text)` - Translation placeholder (for future Google Translate integration)
- `processVideoForUrduDubbing(description, autoTranslate)` - Full dubbing pipeline
- `isConfigured()` - Check if API key is set
- `getUsageInfo()` - Monitor free tier usage

**Setup:**
Add to `.env`:
```
ELEVENLABS_API_KEY=your_api_key_here
```

**Free Tier:**
- 10,000 characters/month
- Multilingual v2 model supports Urdu
- High-quality voice synthesis

### 4. Cloudinary Audio Upload
**File:** `backend/services/cloudinary.service.js`

**New Method:**
- `uploadAudio(audioBuffer)` - Upload dubbed audio to Cloudinary

### 5. Routes Registered
**File:** `backend/server.js`
- Added `app.use('/api/courses', courseRoutes)`

## 🎯 NEXT: Frontend Components

### Components to Create:

#### 1. CreateCoursePage.jsx
**Path:** `frontend/src/pages/CreateCoursePage.jsx`
**Features:**
- Course details form (title, description, category, level)
- Thumbnail upload
- Multiple video uploads with titles
- Document uploads
- Skill selection (multi-select)
- Price/coins setting
- **Urdu Dubbing Option:**
  - Checkbox for each video: "Add Urdu dubbing"
  - Text area for Urdu script
  - Generate button that calls dubbing API
  - Preview generated audio
- Save as draft or publish
- Progress indicator during uploads

#### 2. MyCoursesPage.jsx
**Path:** `frontend/src/pages/MyCoursesPage.jsx`
**Features:**
- List of user's created courses
- Stats cards: Total courses, Total enrollments, Avg rating
- Course cards with:
  - Thumbnail
  - Title, views, enrollments
  - Edit/Delete buttons
  - Publish/Unpublish toggle
- Empty state: "Create your first course"
- Click to edit or view details

#### 3. CoursesPage.jsx (Browse All)
**Path:** `frontend/src/pages/CoursesPage.jsx`
**Features:**
- Search bar
- Filter by category, level, skills
- Sort by: newest, popular, highest rated
- Course grid with cards:
  - Thumbnail
  - Instructor name/avatar
  - Title, rating, enrollments
  - Price/coins required
  - 🔒 Locked icon if no access
- Click to view details

#### 4. CourseDetailPage.jsx
**Path:** `frontend/src/pages/CourseDetailPage.jsx`
**Features:**
- Course header: title, instructor, rating
- Video player (if has access) or locked message
- Urdu audio player (if available)
- Video list with durations
- Document list with download buttons (if has access)
- Enrollment button
- Reviews section
- Access requirement message:
  - "Complete a trade with [Instructor] to unlock this course"
  - Link to instructor's profile

#### 5. Update ProfilePage.jsx
**Path:** `frontend/src/pages/ProfilePage.jsx`
**Add Section:**
- "Courses by [Name]" tab
- Show all user's published courses
- Locked/unlocked based on viewer's trade status
- Click to view course details

### API Functions to Add:
**File:** `frontend/src/services/api.js`

```javascript
// Courses
export const getCourses = async (filters) => { ... }
export const getCourseById = async (courseId) => { ... }
export const getMyCourses = async () => { ... }
export const getUserCourses = async (userId) => { ... }
export const createCourse = async (courseData) => { ... }
export const updateCourse = async (courseId, courseData) => { ... }
export const deleteCourse = async (courseId) => { ... }
export const publishCourse = async (courseId) => { ... }
export const enrollInCourse = async (courseId) => { ... }
export const rateCourse = async (courseId, rating, review) => { ... }
export const generateUrduDubbing = async (courseId, videoId, urduScript) => { ... }
```

### Navigation Updates:
**Files:** `App.jsx`, `Navbar.jsx`

**Add Routes:**
```jsx
<Route path="/courses" element={<PrivateRoute><CoursesPage /></PrivateRoute>} />
<Route path="/courses/create" element={<PrivateRoute><CreateCoursePage /></PrivateRoute>} />
<Route path="/courses/my" element={<PrivateRoute><MyCoursesPage /></PrivateRoute>} />
<Route path="/courses/:id" element={<PrivateRoute><CourseDetailPage /></PrivateRoute>} />
```

**Add Nav Links:**
- "Courses" → /courses
- "My Courses" → /courses/my
- "+ Create Course" → /courses/create (dropdown or separate)

## 🔒 Access Control Flow

### How It Works:

1. **User Creates Course:**
   - Uploads videos, documents
   - Optionally adds Urdu dubbing
   - Publishes course

2. **Other Users Browse:**
   - See all published courses
   - Can view course details
   - **Cannot** access videos/documents without trade

3. **To Unlock Content:**
   - User must complete a trade with the instructor
   - Backend checks: `Trade.findOne({ teacher: instructorId, learner: userId, status: 'completed' })`
   - If trade exists → Full access
   - If no trade → Show locked content

4. **After Trade Completed:**
   - User can enroll in course
   - Access all videos and documents
   - Download files
   - Rate and review

### Example User Flow:

```
Alice creates a "React Mastery" course
  ↓
Bob finds Alice's course in browse
  ↓
Bob sees: "🔒 Complete a trade with Alice to unlock"
  ↓
Bob sends proposal to Alice's post
  ↓
Alice accepts → Trade created
  ↓
They complete the session → Trade status = 'completed'
  ↓
Bob can now access Alice's course!
  ↓
Bob enrolls and watches all videos
```

## 🎙️ Urdu Dubbing Workflow

### In CreateCoursePage:

1. User uploads video
2. Checks "Add Urdu Dubbing" option
3. Enters Urdu script in text area
4. Clicks "Generate Dubbing"
5. Frontend calls: `POST /api/courses/:id/videos/:videoId/dub`
6. Backend:
   - Calls ElevenLabs API with Urdu text
   - Receives audio buffer
   - Uploads to Cloudinary
   - Updates video with `dubbedAudioUrl`
7. Success message: "Urdu dubbing added!"

### In CourseDetailPage:

1. Video player shows original video
2. If `hasDubbing === true`:
   - Show audio player below video
   - Label: "🎙️ Urdu Audio Track"
   - User can listen to Urdu dubbing while watching

## 📊 Statistics & Analytics

### MyCoursesPage Stats:
- Total courses created
- Total enrollments across all courses
- Average rating
- Total views

### Individual Course Stats:
- View count
- Enrollment count
- Average rating (1-5 stars)
- Number of ratings

## 🚀 Implementation Priority

**Phase 1 (Current):**
✅ Course model
✅ Course controller with all endpoints
✅ ElevenLabs integration
✅ Cloudinary audio upload
✅ Routes registered

**Phase 2 (Next - HIGH PRIORITY):**
- [ ] CreateCoursePage with full upload functionality
- [ ] MyCoursesPage to manage courses
- [ ] Course API functions in frontend
- [ ] Add routes to App.jsx and Navbar

**Phase 3:**
- [ ] CoursesPage (browse all)
- [ ] CourseDetailPage with access control
- [ ] Update ProfilePage with courses section
- [ ] Urdu dubbing UI in CreateCoursePage

**Phase 4:**
- [ ] Enrollment system
- [ ] Rating and review system
- [ ] Progress tracking
- [ ] Course analytics dashboard

## 🔑 Environment Variables Required

Add to `backend/.env`:
```
ELEVENLABS_API_KEY=sk_your_api_key_here
```

Get free API key from: https://elevenlabs.io/
- Sign up
- Get API key from settings
- Free tier: 10,000 characters/month

## 📝 Summary

**Backend Complete:** ✅
- Full course system with videos, documents
- Access control based on completed trades
- Urdu dubbing with ElevenLabs
- All CRUD operations
- Enrollment and rating system

**Frontend To Do:** 🔨
- Create course pages
- Upload interfaces
- Video/audio players
- Access control UI
- Profile integration

**Key Feature:** 🎯
Content is **locked until trade is completed** with the instructor!
