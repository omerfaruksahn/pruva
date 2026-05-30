const express = require('express');
const router = express.Router();
const offerController = require('../offerController');
const auth = require('../authMiddleware');
const { offer } = require('../validationSchemas');

// @route   POST api/offers
router.post('/', [auth, offer], offerController.createOffer);

// @route   POST api/offers/:id/accept
router.post('/:id/accept', auth, offerController.acceptOffer);

// @route   PUT api/offers/:id
router.put('/:id', [auth, offer], offerController.updateOffer);

// @route   DELETE api/offers/:id
router.delete('/:id', auth, offerController.deleteOffer);

module.exports = router;
