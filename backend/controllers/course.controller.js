const Course = require('../models/course.model');
const User = require('../models/user.model');
const Trade = require('../models/trade.model');
const dubbingService = require('../services/ai-dubbing.service');
const cloudinary = require('../services/cloudinary.service');

// @desc    Create new course
// @route   POST /api/courses
// @access  Private
exports.createCourse = async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user._id,
    };

    const course = await Course.create(courseData);
    
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    next(error);
  }
};

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res, next) => {
  try {
    const { skill, category, level, search } = req.query;
    
    const query = { isPublished: true };
    
    if (skill) query.skills = skill;
    if (category) query.category = category;
    if (level && level !== 'all') query.level = level;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar rating')
      .populate('skills', 'name category')
      .select('-enrollments -ratings')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    next(error);
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar rating bio')
      .populate('skills', 'name category')
      .populate('ratings.user', 'name avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check access
    const hasAccess = await course.hasAccess(req.user._id);

    // Convert to plain object
    const courseObj = course.toObject();

    // If no access, hide videos and documents URLs
    if (!hasAccess) {
      courseObj.videos = courseObj.videos.map(v => ({
        ...v,
        url: '🔒 Locked - Complete a trade to access',
        dubbedAudioUrl: null,
      }));
      courseObj.documents = courseObj.documents.map(d => ({
        ...d,
        url: '🔒 Locked - Complete a trade to access',
      }));
    }

    // Increment views
    course.stats.views += 1;
    await course.save();

    res.status(200).json({
      success: true,
      data: courseObj,
      hasAccess,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    next(error);
  }
};

// @desc    Get user's created courses
// @route   GET /api/courses/my/created
// @access  Private
exports.getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('skills', 'name category')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching my courses:', error);
    next(error);
  }
};

// @desc    Get courses by instructor ID
// @route   GET /api/courses/instructor/:userId
// @access  Private
exports.getCoursesByInstructor = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await Course.getAccessibleCourses(req.user._id, userId);

    res.status(200).json({
      success: true,
      count: result.courses.length,
      data: result.courses,
      hasAccess: result.hasAccess,
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor only)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('instructor', 'name avatar rating')
      .populate('skills', 'name category');

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor only)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course',
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    next(error);
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user has access
    const hasAccess = await course.hasAccess(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Complete a trade with the instructor to access this course',
      });
    }

    const result = await course.enrollUser(req.user._id);

    if (result.alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: course,
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    next(error);
  }
};

// @desc    Rate course
// @route   POST /api/courses/:id/rate
// @access  Private
exports.rateCourse = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user already rated
    const existingRating = course.ratings.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      course.ratings.push({
        user: req.user._id,
        rating,
        review,
      });
    }

    // Recalculate average rating
    const totalRating = course.ratings.reduce((sum, r) => sum + r.rating, 0);
    course.stats.averageRating = totalRating / course.ratings.length;
    course.stats.ratingCount = course.ratings.length;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course rated successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error rating course:', error);
    next(error);
  }
};

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Private (Instructor only)
exports.togglePublish = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    course.isPublished = !course.isPublished;
    course.isDraft = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      data: course,
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    next(error);
  }
};

// @desc    Generate Urdu dubbing for video
// @route   POST /api/courses/:id/videos/:videoId/dub
// @access  Private (Instructor only)
exports.generateUrduDubbing = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const { urduScript } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const video = course.videos.id(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    if (!urduScript || !urduScript.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Urdu script is required',
      });
    }

    // Generate Urdu dubbing
    const dubbing = await dubbingService.generateUrduDubbing(urduScript);

    if (!dubbing.success) {
      return res.status(500).json({
        success: false,
        message: dubbing.message || 'Failed to generate dubbing',
      });
    }

    // Upload audio to Cloudinary
    const audioUpload = await cloudinary.uploadAudio(dubbing.audioBuffer);

    // Update video with dubbed audio
    video.hasDubbing = true;
    video.dubbedAudioUrl = audioUpload.secure_url;
    video.dubbedAudioPublicId = audioUpload.public_id;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Urdu dubbing generated successfully',
      data: {
        videoId: video._id,
        dubbedAudioUrl: video.dubbedAudioUrl,
      },
    });
  } catch (error) {
    console.error('Error generating dubbing:', error);
    next(error);
  }
};
