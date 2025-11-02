const TradeProposal = require('../models/trade-proposal.model');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const Trade = require('../models/trade.model');

// @desc    Create a trade proposal
// @route   POST /api/trade-proposals/propose
// @access  Private
exports.createProposal = async (req, res, next) => {
  try {
    const {
      targetPostId,
      proposalType,
      offering,
      message,
      numberOfSessions,
    } = req.body;

    console.log('📝 Create Proposal Request:', {
      targetPostId,
      proposalType,
      offering,
      messageLength: message?.length,
      numberOfSessions,
    });

    if (!targetPostId || !proposalType || !message) {
      console.log('❌ Validation failed:', { targetPostId, proposalType, hasMessage: !!message });
      return res.status(400).json({
        success: false,
        message: 'Target post, proposal type, and message are required',
      });
    }

    const targetPost = await Post.findById(targetPostId).populate('user');
    if (!targetPost) {
      console.log('❌ Post not found:', targetPostId);
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (targetPost.user._id.toString() === req.user._id.toString()) {
      console.log('❌ Cannot propose to own post');
      return res.status(400).json({
        success: false,
        message: 'Cannot propose to your own post',
      });
    }

    if (proposalType === 'trade' && !offering) {
      console.log('❌ Trade proposal without offering');
      return res.status(400).json({
        success: false,
        message: 'Must specify what you are offering for a trade',
      });
    }

    const proposal = await TradeProposal.create({
      proposer: req.user._id,
      targetPost: targetPostId,
      receiver: targetPost.user._id,
      proposalType,
      offering,
      message,
      numberOfSessions: numberOfSessions || 1,
    });

    await proposal.populate('proposer', 'name email avatar');
    await proposal.populate('receiver', 'name email avatar');
    await proposal.populate('targetPost', 'title type gigType');
    if (offering?.skill) {
      await proposal.populate('offering.skill', 'name category');
    }

    res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      data: proposal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get proposals sent by user
// @route   GET /api/trade-proposals/sent
// @access  Private
exports.getSentProposals = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const query = { proposer: req.user._id };
    if (status) query.status = status;

    const proposals = await TradeProposal.find(query)
      .populate('receiver', 'name email avatar')
      .populate('targetPost', 'title type gigType')
      .populate('offering.skill', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get proposals received by user
// @route   GET /api/trade-proposals/received
// @access  Private
exports.getReceivedProposals = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const query = { receiver: req.user._id };
    if (status) query.status = status;

    const proposals = await TradeProposal.find(query)
      .populate('proposer', 'name email avatar')
      .populate('targetPost', 'title type gigType')
      .populate('offering.skill', 'name category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a proposal
// @route   PUT /api/trade-proposals/:id/accept
// @access  Private
exports.acceptProposal = async (req, res, next) => {
  try {
    const { responseMessage, coinAmount, duration } = req.body;

    console.log('✅ Accepting proposal:', req.params.id);
    console.log('📊 Request data:', { responseMessage, coinAmount, duration });

    const proposal = await TradeProposal.findById(req.params.id)
      .populate('proposer', 'name email coins')
      .populate('receiver', 'name email coins')
      .populate('targetPost')
      .populate('targetPost.linkedCourse')
      .populate('offering.skill', 'name');
    
    if (!proposal) {
      console.log('❌ Proposal not found');
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    if (proposal.receiver._id.toString() !== req.user._id.toString()) {
      console.log('❌ Not authorized - user is not receiver');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this proposal',
      });
    }

    if (proposal.status !== 'pending') {
      console.log('❌ Cannot accept - status is:', proposal.status);
      return res.status(400).json({
        success: false,
        message: `Cannot accept ${proposal.status} proposal`,
      });
    }

    console.log('💰 Current coin balances - Proposer:', proposal.proposer.coins, 'Receiver:', proposal.receiver.coins);

    // Accept the proposal
    await proposal.accept(responseMessage || 'Proposal accepted!');
    console.log('✅ Proposal status updated to accepted');

    // Create a Trade if it's a trade proposal
    if (proposal.proposalType === 'trade' && proposal.offering?.skill) {
      const tradeData = {
        teacher: proposal.receiver._id, // The post owner teaches
        learner: proposal.proposer._id, // The proposer learns
        skill: proposal.offering.skill._id,
        coinsAmount: coinAmount || 50,
        duration: duration || 60,
        status: 'accepted',
        notes: `Trade proposal accepted: ${proposal.targetPost.title}`,
        relatedProposal: proposal._id,
      };

      const trade = await Trade.create(tradeData);
      console.log('✅ Trade created:', trade._id, 'Amount:', trade.coinsAmount, 'coins');
      console.log('ℹ️  Note: Coins will be transferred when trade is marked as COMPLETED');
    }

    // If the post has a linked course, enroll the proposer (learner)
    if (proposal.targetPost && proposal.targetPost.linkedCourse) {
      const Course = require('../models/course.model');
      try {
        await Course.findByIdAndUpdate(
          proposal.targetPost.linkedCourse,
          { 
            $addToSet: { 
              enrollments: { 
                user: proposal.proposer._id,
                enrolledAt: new Date(),
                progress: 0
              } 
            } 
          }
        );
        console.log('✅ Learner enrolled in linked course:', proposal.targetPost.linkedCourse);
      } catch (courseError) {
        console.error('⚠️ Failed to enroll in course:', courseError.message);
        // Don't fail the trade acceptance if course enrollment fails
      }
    }

    await proposal.populate('proposer', 'name email avatar');
    await proposal.populate('targetPost', 'title type');

    console.log('🎉 Proposal accepted successfully!');
    res.status(200).json({
      success: true,
      message: 'Proposal accepted and trade created. Coins will be transferred when the session is completed.',
      data: proposal,
    });
  } catch (error) {
    console.error('❌ Error accepting proposal:', error);
    next(error);
  }
};

// @desc    Reject a proposal
// @route   PUT /api/trade-proposals/:id/reject
// @access  Private
exports.rejectProposal = async (req, res, next) => {
  try {
    const { responseMessage } = req.body;

    const proposal = await TradeProposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    if (proposal.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this proposal',
      });
    }

    await proposal.reject(responseMessage || 'Proposal rejected');
    await proposal.populate('proposer', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Proposal rejected',
      data: proposal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule a session for accepted proposal
// @route   POST /api/trade-proposals/:id/schedule
// @access  Private
exports.scheduleSession = async (req, res, next) => {
  try {
    const { date, startTime, endTime, meetingLink } = req.body;

    const proposal = await TradeProposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    const isAuthorized = 
      proposal.proposer.toString() === req.user._id.toString() ||
      proposal.receiver.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to schedule sessions for this proposal',
      });
    }

    if (proposal.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only schedule sessions for accepted proposals',
      });
    }

    await proposal.addSession({ date, startTime, endTime, meetingLink });

    res.status(200).json({
      success: true,
      message: 'Session scheduled successfully',
      data: proposal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark session as completed
// @route   PUT /api/trade-proposals/:id/sessions/:sessionId/complete
// @access  Private
exports.completeSession = async (req, res, next) => {
  try {
    const proposal = await TradeProposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    const isAuthorized = 
      proposal.proposer.toString() === req.user._id.toString() ||
      proposal.receiver.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await proposal.completeSession(req.params.sessionId);

    res.status(200).json({
      success: true,
      message: 'Session marked as completed',
      data: proposal,
    });
  } catch (error) {
    next(error);
  }
};
