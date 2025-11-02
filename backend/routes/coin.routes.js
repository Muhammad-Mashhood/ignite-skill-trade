const express = require('express');
const {
  getBalance,
  getTransactions,
  awardBonus,
} = require('../controllers/coin.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/balance', protect, getBalance);
router.get('/transactions', protect, getTransactions);
router.post('/bonus', protect, awardBonus);

module.exports = router;
