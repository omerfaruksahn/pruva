const express = require('express');
const router = express.Router();
const coinController = require('../coinController');
const auth = require('../authMiddleware');

// @route   GET api/coins/balance
router.get('/balance', auth, coinController.getBalance);

// @route   POST api/coins/buy
router.post('/buy', auth, coinController.buyCoins);

// @route   GET api/coins/history
router.get('/history', auth, coinController.getHistory);

module.exports = router;
