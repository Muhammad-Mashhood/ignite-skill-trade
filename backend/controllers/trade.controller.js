const Trade = require('../models/trade.model');
const User = require('../models/user.model');
const { processTransaction } = require('../services/coin-economy.service');

// @desc    Create new trade request
// @route   POST /api/trades
// @access  Private
exports.createTrade = async (req, res, next) => {
  try {
    const { teacherId, skillId, sessionType, scheduledAt, duration, notes } = req.body;

    // Check if learner has enough coins
    const learner = await User.findById(req.user.id);
    const coinsRequired = 50; // Default coins per session

    if (learner.coins < coinsRequired) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    const trade = await Trade.create({
      teacher: teacherId,
      learner: req.user.id,
      skill: skillId,
      coinsAmount: coinsRequired,
      sessionType,
      scheduledAt,
      duration: duration || 60,
      notes,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trades for user
// @route   GET /api/trades
// @access  Private
exports.getTrades = async (req, res, next) => {
  try {
    const { status, role } = req.query;

    let query = {
      $or: [{ teacher: req.user.id }, { learner: req.user.id }],
    };

    if (status) {
      query.status = status;
    }

    if (role === 'teacher') {
      query = { teacher: req.user.id };
    } else if (role === 'learner') {
      query = { learner: req.user.id };
    }

    const trades = await Trade.find(query)
      .populate('teacher', 'name email avatar rating')
      .populate('learner', 'name email avatar rating')
      .populate('skill')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trades.length,
      data: trades,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept trade request
// @route   PUT /api/trades/:id/accept
// @access  Private (Teacher only)
exports.acceptTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    if (trade.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trade.status = 'accepted';
    await trade.save();

    res.status(200).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete trade and transfer coins
// @route   PUT /api/trades/:id/complete
// @access  Private (Teacher only)
exports.completeTrade = async (req, res, next) => {
  try {
    console.log('🔄 Completing trade:', req.params.id);
    console.log('👤 Requested by user:', req.user.id);
    
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      console.log('❌ Trade not found');
      return res.status(404).json({ message: 'Trade not found' });
    }

    console.log('📊 Trade details:', {
      id: trade._id,
      teacher: trade.teacher,
      learner: trade.learner,
      coinsAmount: trade.coinsAmount,
      status: trade.status
    });

    if (trade.teacher.toString() !== req.user.id) {
      console.log('❌ Not authorized - user is not the teacher');
      return res.status(403).json({ message: 'Not authorized' });
    }

    console.log('💰 Processing coin transaction...');
    // Transfer coins from learner to teacher
    const transactionResult = await processTransaction(trade);
    console.log('✅ Transaction processed:', transactionResult);

    trade.status = 'completed';
    trade.completedAt = Date.now();
    await trade.save();
    console.log('✅ Trade status updated to completed');

    // Update user session counts
    await User.findByIdAndUpdate(trade.teacher, {
      $inc: { totalSessionsCompleted: 1 },
    });
    await User.findByIdAndUpdate(trade.learner, {
      $inc: { totalSessionsCompleted: 1 },
    });
    console.log('✅ User session counts updated');

    // Populate trade data for response
    const completedTrade = await Trade.findById(trade._id)
      .populate('teacher', 'name email avatar rating coins')
      .populate('learner', 'name email avatar rating coins')
      .populate('skill');

    console.log('🎉 Trade completed successfully!');
    res.status(200).json({
      success: true,
      data: completedTrade,
    });
  } catch (error) {
    console.error('❌ Error completing trade:', error);
    next(error);
  }
};

// @desc    Rate a completed trade
// @route   PUT /api/trades/:id/rate
// @access  Private
exports.rateTrade = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    if (trade.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed trades' });
    }

    if (
      trade.teacher.toString() !== req.user.id &&
      trade.learner.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trade.rating = {
      score,
      feedback,
      ratedBy: req.user.id,
      ratedAt: Date.now(),
    };
    await trade.save();

    // Update teacher's rating
    const teacherId = trade.teacher;
    const teacher = await User.findById(teacherId);
    const newCount = teacher.rating.count + 1;
    const newAverage =
      (teacher.rating.average * teacher.rating.count + score) / newCount;

    teacher.rating.average = newAverage;
    teacher.rating.count = newCount;
    await teacher.save();

    res.status(200).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};
