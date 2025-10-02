import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1DB954', // Spotify Green
    },
    secondary: {
      main: '#191414', // Dark Grey
    },
    background: {
      default: '#FFFFFF',
      paper: '#f5f5f5',
    },
    error: {
      main: '#F44336', // Material Red
    },
    success: {
      main: '#4CAF50', // Material Green
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;