/**
 * Feed Recommendation Service
 * Provides personalized post recommendations based on user preferences
 */

const Post = require('../models/post.model');
const User = require('../models/user.model');

class FeedService {
  /**
   * Calculate match score between user and post
   * Higher score = better match
   */
  calculateMatchScore(user, post) {
    let score = 0;
    const weights = {
      skillMatch: 50,        // User wants to learn what post teaches
      reverseMatch: 40,      // User can teach what post wants to learn
      interestMatch: 10,     // Interested users similarity
      recency: 5,            // Recent posts get slight boost
      engagement: 5,         // Popular posts get boost
    };

    // Get user's skills from their own posts
    const userTeachingSkills = this.getUserTeachingSkills(user);
    const userLearningSkills = this.getUserLearningSkills(user);

    // 1. SKILL MATCH: User wants to learn what post teaches
    if (post.willTeach && post.willTeach.length > 0) {
      const matchingTeachSkills = post.willTeach.filter(postSkill => 
        userLearningSkills.some(userSkill => 
          this.skillsMatch(userSkill, postSkill.customSkillName)
        )
      );
      score += (matchingTeachSkills.length / post.willTeach.length) * weights.skillMatch;
    }

    // 2. REVERSE MATCH: User can teach what post wants to learn
    if (post.wantToLearn && post.wantToLearn.length > 0) {
      const matchingLearnSkills = post.wantToLearn.filter(postSkill => 
        userTeachingSkills.some(userSkill => 
          this.skillsMatch(userSkill, postSkill.customSkillName)
        )
      );
      score += (matchingLearnSkills.length / post.wantToLearn.length) * weights.reverseMatch;
    }

    // 3. INTEREST MATCH: Similar interests (if user has shown interest in similar posts)
    if (user.interestedPosts && user.interestedPosts.length > 0) {
      // Boost posts with similar tags
      const userInterestTags = this.getUserInterestTags(user);
      const matchingTags = post.tags?.filter(tag => 
        userInterestTags.includes(tag.toLowerCase())
      ) || [];
      score += (matchingTags.length / Math.max(post.tags?.length || 1, 1)) * weights.interestMatch;
    }

    // 4. RECENCY: Newer posts get a small boost
    const daysSincePosted = (Date.now() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24);
    const recencyBoost = Math.max(0, 1 - (daysSincePosted / 30)); // Decay over 30 days
    score += recencyBoost * weights.recency;

    // 5. ENGAGEMENT: Posts with more views and interests get boost
    const engagementScore = Math.min(1, (post.stats?.views || 0) / 100 + (post.stats?.interests || 0) / 20);
    score += engagementScore * weights.engagement;

    return Math.round(score);
  }

  /**
   * Get user's teaching skills from their posts
   */
  getUserTeachingSkills(user) {
    if (!user.posts) return [];
    
    const skills = [];
    user.posts.forEach(post => {
      if (post.willTeach) {
        post.willTeach.forEach(skill => {
          if (skill.customSkillName) {
            skills.push(skill.customSkillName.toLowerCase());
          }
        });
      }
    });
    return [...new Set(skills)]; // Remove duplicates
  }

  /**
   * Get user's learning interests from their posts
   */
  getUserLearningSkills(user) {
    if (!user.posts) return [];
    
    const skills = [];
    user.posts.forEach(post => {
      if (post.wantToLearn) {
        post.wantToLearn.forEach(skill => {
          if (skill.customSkillName) {
            skills.push(skill.customSkillName.toLowerCase());
          }
        });
      }
    });
    return [...new Set(skills)];
  }

  /**
   * Get tags from posts user has shown interest in
   */
  getUserInterestTags(user) {
    if (!user.interestedPosts) return [];
    
    const tags = [];
    user.interestedPosts.forEach(post => {
      if (post.tags) {
        tags.push(...post.tags.map(t => t.toLowerCase()));
      }
    });
    return [...new Set(tags)];
  }

  /**
   * Check if two skill names match (fuzzy matching)
   */
  skillsMatch(skill1, skill2) {
    const s1 = skill1.toLowerCase().trim();
    const s2 = skill2.toLowerCase().trim();
    
    // Exact match
    if (s1 === s2) return true;
    
    // Partial match (one contains the other)
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Check for common variations
    const variations = {
      'javascript': ['js', 'node', 'nodejs', 'react', 'vue', 'angular'],
      'python': ['py', 'django', 'flask', 'machine learning', 'ml'],
      'web development': ['web dev', 'frontend', 'backend', 'fullstack'],
      'guitar': ['acoustic guitar', 'electric guitar', 'bass guitar'],
      'photography': ['photo', 'camera', 'digital photography'],
      'cooking': ['culinary', 'baking', 'chef'],
    };

    for (const [key, values] of Object.entries(variations)) {
      if ((s1.includes(key) || values.some(v => s1.includes(v))) &&
          (s2.includes(key) || values.some(v => s2.includes(v)))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get personalized feed for user with pagination
   */
  async getPersonalizedFeed(userId, page = 1, limit = 30) {
    try {
      // Get user with their skills and interests
      const user = await User.findById(userId)
        .populate('skillsToTeach.skillId')
        .populate('skillsToLearn.skillId');

      if (!user) {
        throw new Error('User not found');
      }

      // Get all active posts (exclude user's own posts)
      const allPosts = await Post.find({
        user: { $ne: userId },
        status: 'active',
        expiresAt: { $gt: new Date() },
      })
        .populate('user', 'name email avatar rating')
        .populate('willTeach.skill', 'name category')
        .populate('wantToLearn.skill', 'name category')
        .lean();

      // Calculate match score for each post
      const scoredPosts = allPosts.map(post => ({
        ...post,
        matchScore: this.calculateMatchScore(user, post),
      }));

      // Sort by match score (descending)
      scoredPosts.sort((a, b) => b.matchScore - a.matchScore);

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedPosts = scoredPosts.slice(skip, skip + limit);

      return {
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: scoredPosts.length,
          pages: Math.ceil(scoredPosts.length / limit),
          hasMore: skip + limit < scoredPosts.length,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get trending posts (most engagement in last 7 days)
   */
  async getTrendingPosts(limit = 10) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return await Post.find({
      status: 'active',
      createdAt: { $gte: sevenDaysAgo },
    })
      .populate('user', 'name email avatar rating')
      .sort({ 'stats.views': -1, 'stats.interests': -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get recent posts (fallback when user has no preferences)
   */
  async getRecentPosts(userId, page = 1, limit = 30) {
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      user: { $ne: userId },
      status: 'active',
      expiresAt: { $gt: new Date() },
    })
      .populate('user', 'name email avatar rating')
      .populate('willTeach.skill', 'name category')
      .populate('wantToLearn.skill', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({
      user: { $ne: userId },
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    return {
      posts: posts.map(post => ({ ...post, matchScore: 0 })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  }
}

module.exports = new FeedService();
