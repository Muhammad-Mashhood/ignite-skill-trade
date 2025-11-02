const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');

/**
 * Process coin transaction for completed trade
 * @param {Object} trade - Trade object
 */
exports.processTransaction = async (trade) => {
  try {
    console.log('💰 Processing transaction for trade:', trade._id);
    
    const learner = await User.findById(trade.learner);
    const teacher = await User.findById(trade.teacher);

    if (!learner || !teacher) {
      console.log('❌ User not found - learner:', !!learner, 'teacher:', !!teacher);
      throw new Error('User not found');
    }

    console.log('💵 Current balances - Learner:', learner.coins, 'Teacher:', teacher.coins);
    console.log('💸 Transaction amount:', trade.coinsAmount);

    // Check if learner has enough coins
    if (learner.coins < trade.coinsAmount) {
      console.log('❌ Insufficient coins - has:', learner.coins, 'needs:', trade.coinsAmount);
      throw new Error('Insufficient coins');
    }

    // Deduct coins from learner
    learner.coins -= trade.coinsAmount;
    await learner.save();
    console.log('✅ Deducted', trade.coinsAmount, 'coins from learner. New balance:', learner.coins);

    // Create transaction record for learner
    await Transaction.create({
      user: learner._id,
      type: 'spend',
      amount: -trade.coinsAmount,
      balanceAfter: learner.coins,
      relatedTrade: trade._id,
      description: `Paid for learning session: ${trade.skill}`,
    });
    console.log('✅ Created spend transaction record for learner');

    // Add coins to teacher
    teacher.coins += trade.coinsAmount;
    await teacher.save();
    console.log('✅ Added', trade.coinsAmount, 'coins to teacher. New balance:', teacher.coins);

    // Create transaction record for teacher
    await Transaction.create({
      user: teacher._id,
      type: 'earn',
      amount: trade.coinsAmount,
      balanceAfter: teacher.coins,
      relatedTrade: trade._id,
      description: `Earned from teaching session: ${trade.skill}`,
    });
    console.log('✅ Created earn transaction record for teacher');

    console.log('🎉 Transaction completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    throw error;
  }
};

/**
 * Award coins to user (for achievements, bonuses, etc.)
 * @param {String} userId - User ID
 * @param {Number} amount - Coin amount
 * @param {String} description - Reason for award
 */
exports.awardCoins = async (userId, amount, description) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.coins += amount;
    await user.save();

    await Transaction.create({
      user: userId,
      type: 'bonus',
      amount,
      balanceAfter: user.coins,
      description,
    });

    return { success: true, newBalance: user.coins };
  } catch (error) {
    throw error;
  }
};
