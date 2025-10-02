import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // This will be proxied by Vite to the backend
  withCredentials: true, // Important for sending session cookies
});

export default api;