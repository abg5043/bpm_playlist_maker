import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { CircularProgress, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function App() {
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  // Add a loading state to prevent flicker
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthStatus();
      setIsLoading(false);
    };
    verifyAuth();
  }, [checkAuthStatus]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <HomePage /> : <LoginPage />;
}

export default App;