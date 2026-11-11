import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
rawBaseUrl = rawBaseUrl.trim();
// Replace multiple consecutive slashes with single slash (preserving http:// or https://)
rawBaseUrl = rawBaseUrl.replace(/([^:])\/{2,}/g, '$1/');
// Remove trailing slashes
rawBaseUrl = rawBaseUrl.replace(/\/+$/, '');
// Ensure it ends with /api
if (!rawBaseUrl.endsWith('/api')) {
  rawBaseUrl += '/api';
}

const api = axios.create({
  baseURL: rawBaseUrl,
  timeout: 60000 // 60s timeout to allow Render free tier spin-up
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register') &&
          window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
