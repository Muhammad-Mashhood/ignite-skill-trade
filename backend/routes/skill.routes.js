const express = require('express');
const {
  getSkills,
  createSkill,
  getSkill,
  updateSkill,
  deleteSkill,
} = require('../controllers/skill.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/').get(getSkills).post(protect, createSkill);
router.route('/:id').get(getSkill).put(protect, updateSkill).delete(protect, deleteSkill);

module.exports = router;
