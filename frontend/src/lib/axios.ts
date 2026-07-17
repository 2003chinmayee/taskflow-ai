// ─── What is Axios? ───────────────────────────────────────────────
// Axios is a library that makes HTTP requests (API calls) easy.
// Without Axios: fetch('/api/...').then(r => r.json()).then(...)
// With Axios:    axios.get('/api/...').then(...)
// Axios also automatically converts JSON, handles errors, etc.

import axios from 'axios';

// ─── Create a custom Axios instance ───────────────────────────────
// Instead of using axios directly everywhere, we create ONE instance
// with our settings. All API calls use this instance.
// This means we configure baseURL and headers ONCE, not in every file.

const apiClient = axios.create({
  // All requests automatically start with this URL
  // So axios.get('/auth/login') becomes:
  // GET http://localhost:8080/api/v1/auth/login
  baseURL: 'http://localhost:8080',

  headers: {
    'Content-Type': 'application/json',
  },

  // If request takes longer than 30 seconds, cancel it
  timeout: 30000,
});

// ─── Request Interceptor ──────────────────────────────────────────
// This runs BEFORE every request is sent
// We use it to automatically attach the JWT token to every request
// So we don't have to manually add it in every API call

apiClient.interceptors.request.use(
  (config) => {
    // Get the stored auth data from localStorage
    const authData = localStorage.getItem('auth-storage');

    if (authData) {
      try {
        // Parse the JSON string from localStorage
        const parsed = JSON.parse(authData);
        const token = parsed?.state?.accessToken;

        if (token) {
          // Add Authorization header to the request
          // Backend JwtFilter reads this header
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // If parsing fails, just continue without token
        console.error('Failed to parse auth data:', error);
      }
    }

    return config; // Return modified config
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────
// This runs AFTER every response is received
// We use it to handle 401 (unauthorized) errors globally
// If token expired → redirect to login

apiClient.interceptors.response.use(
  (response) => response, // Success: just return the response

  (error) => {
    // Only force logout on a REAL 401 Unauthorized (expired/invalid token)
    // 400/403/404/409/500 are business errors — let the calling code handle them
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('taskflow-org');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;