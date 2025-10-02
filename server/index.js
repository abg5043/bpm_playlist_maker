require('dotenv').config();
const express = require('express');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Routes
const authRoutes = require('./src/routes/auth');
const songsRoutes = require('./src/routes/songs');

app.use('/api/auth', authRoutes);
app.use('/api/songs', songsRoutes);

const playlistRoutes = require('./src/routes/playlist');
app.use('/api/playlist', playlistRoutes);

app.get('/api', (req, res) => {
  res.send('Backend server is running.');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});