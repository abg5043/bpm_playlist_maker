const axios = require('axios');
const querystring = require('querystring');

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET
} = process.env;

const protect = async (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ message: 'Not authorized, no session.' });
  }

  const isTokenExpired = Date.now() >= req.session.expiresAt;

  if (isTokenExpired) {
    console.log('Access token expired, attempting to refresh...');
    try {
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: req.session.refreshToken,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')),
        },
      });

      const { access_token, expires_in, refresh_token } = response.data;

      // Update session with new token details
      req.session.accessToken = access_token;
      req.session.expiresAt = Date.now() + expires_in * 1000;
      // Spotify might return a new refresh token, so update if it exists
      if (refresh_token) {
        req.session.refreshToken = refresh_token;
      }
      req.session.save(); // Save the updated session
      console.log('Access token successfully refreshed.');
      next();
    } catch (error) {
      console.error('Could not refresh access token.', error.response ? error.response.data : error.message);
      // If refresh fails, destroy the session and force re-login
      req.session.destroy();
      return res.status(401).json({ message: 'Not authorized, token refresh failed.' });
    }
  } else {
    // Token is valid, proceed
    next();
  }
};

module.exports = { protect };