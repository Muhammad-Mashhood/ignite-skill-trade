const express = require('express');
const {
  createProposal,
  getSentProposals,
  getReceivedProposals,
  acceptProposal,
  rejectProposal,
  scheduleSession,
  completeSession,
} = require('../controllers/trade-proposal.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Proposal routes
router.post('/propose', createProposal);
router.get('/sent', getSentProposals);
router.get('/received', getReceivedProposals);

// Proposal actions
router.put('/:id/accept', acceptProposal);
router.put('/:id/reject', rejectProposal);

// Session management
router.post('/:id/schedule', scheduleSession);
router.put('/:id/sessions/:sessionId/complete', completeSession);

module.exports = router;
