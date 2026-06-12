import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8070'
});

// Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔑 Token in request:', token ? 'Yes' : 'No');
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401/403 - only redirect if token is actually missing/invalid
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect on 401 (Unauthorized), not 403 (Forbidden)
      console.log('🔒 401 Unauthorized, clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // For 403 and other errors, just reject — let the calling component handle it
    return Promise.reject(error);
  }
);

export default API;