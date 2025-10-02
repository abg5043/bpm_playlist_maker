const express = require('express');
const router = express.Router();
const { generatePlaylist, savePlaylist } = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/playlist/generate
// @desc    Generates a playlist based on target BPM and duration
// @access  Private
router.post('/generate', protect, generatePlaylist);

// @route   POST /api/playlist/save
// @desc    Saves the generated playlist to the user's Spotify account
// @access  Private
router.post('/save', protect, savePlaylist);

module.exports = router;