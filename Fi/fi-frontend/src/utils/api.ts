import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', // Point to backend port
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Single request interceptor for auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fi_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detailed error logging for debugging
    if (error.response) {
      // Server responded with non-2xx status
      console.error('API Error:', {
        endpoint: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data || {},
      });
    } else if (error.request) {
      // No response received
      console.error('API No Response:', {
        endpoint: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // Request setup error
      console.error('API Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;