const express = require('express');
const router = express.Router();
const notificationController = require('../notificationController');
const auth = require('../authMiddleware');

// @route   GET api/notifications
// @desc    Kullanıcının bildirimlerini getir
// @access  Private
router.get('/', auth, notificationController.getMyNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Bildirimi okundu işaretle
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
