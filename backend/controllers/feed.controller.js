const feedService = require('../services/feed.service');

// Get personalized feed
exports.getPersonalizedFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const result = await feedService.getPersonalizedFeed(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting personalized feed:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get personalized feed',
    });
  }
};

// Get trending posts
exports.getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const posts = await feedService.getTrendingPosts(limit);

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Error getting trending posts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get trending posts',
    });
  }
};

// Get recent posts (fallback)
exports.getRecentPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const result = await feedService.getRecentPosts(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting recent posts:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get recent posts',
    });
  }
};
