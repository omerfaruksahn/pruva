const express = require('express');
const router = express.Router();
const authController = require('../authController');
const { register, login } = require('../validationSchemas');
const { authLimiter } = require('../rateLimiter');

// @route   POST api/auth/*
router.use(authLimiter); // Tüm auth işlemlerine sıkı limit uygula

// @route   POST api/auth/register
router.post('/register', register, authController.register);

// @route   POST api/auth/login
router.post('/login', login, authController.login);

// @route   POST api/auth/verify-email-request
router.post('/verify-email-request', authController.resendVerification);

// @route   GET api/auth/verify-email
router.get('/verify-email', authController.verifyEmail);

// @route   POST api/auth/refresh-token
router.post('/refresh-token', authController.refreshToken);

// @route   POST api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
