// client/src/api/axiosInstance.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // DEBUG: Log token attachment in development
    if (import.meta.env.DEV) {
      console.log(`[Axios Debug] Token attached to request: ${config.url}`);
    }
  } else {
    // DEBUG: Log missing token
    if (import.meta.env.DEV) {
      console.warn(`[Axios Debug] No token found in localStorage for request: ${config.url}`);
    }
  }
  return config;
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('[Axios] 401 Unauthorized - clearing auth session');
      
      // Clear auth data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // DEBUG: Check what was cleared
      if (import.meta.env.DEV) {
        console.log('[Axios] LocalStorage cleaned. Remaining token:', localStorage.getItem('token'));
      }
      
      // Small delay to ensure event listeners are ready
      setTimeout(() => {
        window.location.href = '/';
      }, 200);
    }
    
    if (error.response?.status === 403) {
      console.log('[Axios] 403 Forbidden - Access denied');
      if (import.meta.env.DEV && error.response?.data?.debug) {
        console.log('[Axios Debug] Authorization details:', error.response.data.debug);
      }
    }
    
    // Check if it's a network error or server is down
    if (!error.response || error.response?.status >= 500 || error.response?.status === 404) {
      const customError = {
        ...error,
        response: {
          ...error.response,
          data: {
            message: "The server is currently unavailable or offline. Please try again later.",
            ...error.response?.data
          }
        }
      };
      // Overwrite the message if it's a generic 404/502 from proxy or network error
      if (!error.response || typeof error.response.data === 'string' || error.message === 'Network Error') {
        customError.response.data.message = "The server is currently offline or unreachable. Please verify your connection or try again later.";
      }
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;