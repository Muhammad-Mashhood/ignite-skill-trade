const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  getCoursesByInstructor,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  rateCourse,
  togglePublish,
  generateUrduDubbing,
} = require('../controllers/course.controller');

// Public routes
router.get('/', getAllCourses);

// Protected routes
router.use(protect);

router.post('/', createCourse);
router.get('/my/created', getMyCourses);
router.get('/instructor/:userId', getCoursesByInstructor);
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.post('/:id/enroll', enrollInCourse);
router.post('/:id/rate', rateCourse);
router.put('/:id/publish', togglePublish);
router.post('/:id/videos/:videoId/dub', generateUrduDubbing);

module.exports = router;
