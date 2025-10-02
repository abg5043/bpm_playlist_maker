import { Button, Container, Typography, Box } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import api from '../services/api';

const LoginPage = () => {
  const handleLogin = async () => {
    try {
      // Get the redirect URL from the backend
      const { data } = await api.post('/auth/login');
      // Redirect the user to the Spotify authorization page
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('Error during login:', error);
      // You could show a user-facing error message here
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        textAlign="center"
      >
        <MusicNoteIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
          BPM Playlist Generator
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Create perfect running playlists matched to your pace.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
          sx={{
            mt: 4,
            backgroundColor: '#1DB954', // Spotify Green
            '&:hover': {
              backgroundColor: '#1ed760',
            }
          }}
        >
          Connect to Spotify
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;