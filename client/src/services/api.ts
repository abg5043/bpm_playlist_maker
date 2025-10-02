import axios from 'axios';

const api = axios.create({
  // baseURL is no longer needed as we are proxying specific top-level routes
  withCredentials: true, // Important for sending session cookies
});

export default api;