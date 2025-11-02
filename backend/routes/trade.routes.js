const express = require('express');
const {
  createTrade,
  getTrades,
  acceptTrade,
  completeTrade,
  rateTrade,
} = require('../controllers/trade.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/').post(protect, createTrade).get(protect, getTrades);
router.put('/:id/accept', protect, acceptTrade);
router.put('/:id/complete', protect, completeTrade);
router.put('/:id/rate', protect, rateTrade);

module.exports = router;
