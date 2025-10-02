const express = require('express');
const router = express.Router();
const { login, callback, logout, getStatus } = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Initiates Spotify OAuth flow
router.post('/login', login);

// @route   GET /api/auth/callback
// @desc    Handles OAuth callback from Spotify
router.get('/callback', callback);

// @route   POST /api/auth/logout
// @desc    Clears user session
router.post('/logout', logout);

// @route   GET /api/auth/status
// @desc    Check authentication status
router.get('/status', getStatus);

module.exports = router;