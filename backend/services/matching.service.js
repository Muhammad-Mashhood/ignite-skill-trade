const User = require('../models/user.model');

/**
 * Find potential skill exchange matches for a user
 * @param {String} userId - User ID
 * @returns {Array} - Array of matched users
 */
exports.findMatches = async (userId) => {
  try {
    const currentUser = await User.findById(userId)
      .populate('skillsToTeach.skillId')
      .populate('skillsToLearn.skillId');

    if (!currentUser) {
      throw new Error('User not found');
    }

    // Get skills user wants to learn
    const desiredSkills = currentUser.skillsToLearn.map((s) => s.skillId._id);

    // Find users who can teach those skills
    const potentialMatches = await User.find({
      _id: { $ne: userId },
      isActive: true,
      'skillsToTeach.skillId': { $in: desiredSkills },
    })
      .populate('skillsToTeach.skillId')
      .populate('skillsToLearn.skillId')
      .select('-password');

    // Calculate match scores
    const scoredMatches = potentialMatches.map((user) => {
      let score = 0;

      // Check skill compatibility (what they teach vs what I want to learn)
      const teachingSkills = user.skillsToTeach.map((s) => s.skillId._id.toString());
      const learningSkills = currentUser.skillsToLearn.map((s) => s.skillId._id.toString());
      const skillMatch = teachingSkills.filter((s) => learningSkills.includes(s)).length;
      score += skillMatch * 10;

      // Mutual benefit (they want to learn what I teach)
      const theirLearningSkills = user.skillsToLearn.map((s) => s.skillId._id.toString());
      const myTeachingSkills = currentUser.skillsToTeach.map((s) => s.skillId._id.toString());
      const mutualBenefit = theirLearningSkills.filter((s) =>
        myTeachingSkills.includes(s)
      ).length;
      score += mutualBenefit * 15;

      // Language compatibility
      const commonLanguages = currentUser.languages.filter((lang) =>
        user.languages.includes(lang)
      );
      score += commonLanguages.length * 5;

      // Rating bonus
      score += user.rating.average * 2;

      return {
        user,
        matchScore: score,
        commonSkills: skillMatch,
        mutualBenefit: mutualBenefit > 0,
        commonLanguages,
      };
    });

    // Sort by match score
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    return scoredMatches;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recommended teachers for a specific skill
 * @param {String} skillId - Skill ID
 * @param {String} userId - Current user ID
 * @returns {Array} - Array of recommended teachers
 */
exports.getRecommendedTeachers = async (skillId, userId) => {
  try {
    const teachers = await User.find({
      _id: { $ne: userId },
      isActive: true,
      'skillsToTeach.skillId': skillId,
    })
      .populate('skillsToTeach.skillId')
      .select('-password')
      .sort({ 'rating.average': -1, totalSessionsCompleted: -1 })
      .limit(10);

    return teachers;
  } catch (error) {
    throw error;
  }
};
