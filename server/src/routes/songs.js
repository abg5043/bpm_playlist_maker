const express = require('express');
const router = express.Router();
const { getLikedSongs } = require('../controllers/songsController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/songs/liked
// @desc    Fetches user's liked songs with audio features
// @access  Private
router.get('/liked', protect, getLikedSongs);

module.exports = router;