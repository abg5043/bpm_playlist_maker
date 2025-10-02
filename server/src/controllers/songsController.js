const { fetchAllLikedSongs } = require('../services/spotifyService');

// @desc    Fetches user's liked songs
const getLikedSongs = async (req, res) => {
  try {
    const { accessToken, userId } = req.session;
    // The protect middleware should prevent this, but as a safeguard:
    if (!accessToken || !userId) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const likedSongs = await fetchAllLikedSongs(accessToken, userId);
    res.status(200).json(likedSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLikedSongs,
};