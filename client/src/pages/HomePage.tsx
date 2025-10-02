import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';
import { Button, Container, Typography, Box, Avatar, AppBar, Toolbar, Grid, Paper, SelectChangeEvent, CircularProgress, Alert, TextField, Snackbar } from '@mui/material';
import BPMSlider from '../components/BPMSlider';
import DurationSelector from '../components/DurationSelector';
import TrackList from '../components/TrackList';

const ControlsSection = () => {
  const {
    targetBPM,
    durationMinutes,
    setTargetBPM,
    setDurationMinutes,
    generatePlaylist,
    isGenerating
  } = usePlaylistStore();

  const handleBpmChange = (_event: Event, newValue: number | number[]) => {
    setTargetBPM(newValue as number);
  };

  const handleDurationChange = (event: SelectChangeEvent<number>) => {
    setDurationMinutes(event.target.value as number);
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Playlist Settings
      </Typography>
      <Box sx={{ mt: 2 }}>
        <BPMSlider value={targetBPM} onChange={handleBpmChange} />
      </Box>
      <Box sx={{ mt: 4 }}>
        <DurationSelector value={durationMinutes} onChange={handleDurationChange} />
      </Box>
      <Box sx={{ mt: 4, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={generatePlaylist}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Playlist'}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={generatePlaylist}
          disabled={isGenerating}
        >
          Regenerate
        </Button>
      </Box>
    </Paper>
  );
};

const PlaylistSection = () => {
  const {
    playlist, isGenerating, generateError, generateMessage,
    playlistName, setPlaylistName,
    isSaving, saveError, saveSuccessMessage, savePlaylist, clearSaveStatus
  } = usePlaylistStore();

  useEffect(() => {
    // Clear save status when a new playlist is generated or component unmounts
    return () => {
      clearSaveStatus();
    };
  }, [clearSaveStatus]);

  if (isGenerating) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box textAlign="center">
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Analyzing your music...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, minHeight: '400px' }}>
      {generateError && <Alert severity="error" sx={{ mb: 2 }}>{generateError}</Alert>}

      {playlist.length > 0 ? (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              fullWidth
              label="Playlist Name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              variant="outlined"
              sx={{ mr: 2 }}
            />
            <Button
              variant="contained"
              onClick={savePlaylist}
              disabled={isSaving || playlist.length === 0}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {isSaving ? 'Saving...' : 'Save to Spotify'}
            </Button>
          </Box>
          {generateMessage && <Alert severity="info" sx={{ mb: 2 }}>{generateMessage}</Alert>}
          <TrackList tracks={playlist} />
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
          <Typography sx={{ color: 'text.secondary' }}>
            Your playlist will appear here once generated.
          </Typography>
        </Box>
      )}
      <Snackbar open={!!saveSuccessMessage} autoHideDuration={6000} onClose={clearSaveStatus}>
        <Alert onClose={clearSaveStatus} severity="success" sx={{ width: '100%' }}>
          {saveSuccessMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={!!saveError} autoHideDuration={6000} onClose={clearSaveStatus}>
        <Alert onClose={clearSaveStatus} severity="error" sx={{ width: '100%' }}>
          {saveError}
        </Alert>
      </Snackbar>
    </Paper>
  );
};


const HomePage = () => {
  const { user, logout } = useAuthStore();

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: 'secondary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BPM Playlist Generator
          </Typography>
          <Typography sx={{ mr: 2 }}>{user?.displayName}</Typography>
          <Avatar alt={user?.displayName || 'User'} src={user?.imageUrl || undefined} sx={{ width: 40, height: 40, mr: 1 }} />
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <ControlsSection />
          </Grid>
          <Grid item xs={12} md={8}>
            <PlaylistSection />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;