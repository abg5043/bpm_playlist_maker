const querystring = require('querystring');
const axios = require('axios');

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  REDIRECT_URI
} = process.env;

// @desc    Initiates Spotify OAuth flow by redirecting user
const login = (req, res) => {
  const scopes = 'user-library-read playlist-modify-public playlist-modify-private user-top-read';
  const redirectUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
      show_dialog: true, // Forces user to re-approve so we get a refresh token
    });

  // The PRD says this endpoint should return a redirect URL.
  // The frontend will then handle the redirect.
  res.json({ redirectUrl });
};

// @desc    Handles OAuth callback from Spotify
const callback = async (req, res) => {
  const code = req.query.code || null;
  const error = req.query.error || null;

  if (error) {
    console.error('Spotify callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URI}?error=auth_failed`);
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')),
      },
    });

    const { access_token, refresh_token, expires_in } = response.data;

    const { data: userProfile } = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    // Store tokens and user info in session
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    req.session.expiresAt = Date.now() + expires_in * 1000;
    req.session.userId = userProfile.id;
    req.session.isAuthenticated = true;

    // Redirect to the frontend application
    res.redirect(process.env.FRONTEND_URI);

  } catch (err) {
    console.error('Error exchanging code for tokens:', err.response ? err.response.data : err.message);
    res.redirect(`${process.env.FRONTEND_URI}?error=token_exchange_failed`);
  }
};

// @desc    Clears user session
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    // Clears the session cookie
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
};

// @desc    Check authentication status and return user profile
const getStatus = async (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ isAuthenticated: false, user: null });
  }

  try {
    // Fetch user profile from Spotify to confirm token is valid
    const { data: userProfile } = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${req.session.accessToken}` }
    });

    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: userProfile.id,
        displayName: userProfile.display_name,
        email: userProfile.email,
        imageUrl: userProfile.images[0]?.url || null
      }
    });
  } catch (error) {
    console.error('Error fetching user status:', error.response ? error.response.data : error.message);
    // This could happen if the token expired or was revoked.
    // The frontend should handle this by prompting the user to log in again.
    return res.status(401).json({ isAuthenticated: false, user: null });
  }
};

module.exports = {
  login,
  callback,
  logout,
  getStatus,
};