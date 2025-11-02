const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');

// @desc    Get user's coin balance
// @route   GET /api/coins/balance
// @access  Private
exports.getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('coins');

    res.status(200).json({
      success: true,
      data: {
        coins: user.coins,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transaction history
// @route   GET /api/coins/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { type, limit = 50 } = req.query;

    let query = { user: req.user.id };
    
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('relatedTrade')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Award bonus coins (for achievements, streaks, etc.)
// @route   POST /api/coins/bonus
// @access  Private (Admin or system)
exports.awardBonus = async (req, res, next) => {
  try {
    const { userId, amount, description } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.coins += amount;
    await user.save();

    const transaction = await Transaction.create({
      user: userId,
      type: 'bonus',
      amount,
      balanceAfter: user.coins,
      description,
    });

    res.status(200).json({
      success: true,
      data: {
        transaction,
        newBalance: user.coins,
      },
    });
  } catch (error) {
    next(error);
  }
};
