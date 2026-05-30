const express = require('express');
const router = express.Router();
const listingController = require('../listingController');
const auth = require('../authMiddleware');
const { isApproved } = require('../companyMiddleware');
const { listing } = require('../validationSchemas');

// @route   POST api/listings
router.post('/', [auth, isApproved, listing], listingController.createListing);

// @route   GET api/listings
router.get('/', auth, listingController.getAllListings);

module.exports = router;
