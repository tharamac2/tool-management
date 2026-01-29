import axios from 'axios';

const getBaseUrl = () => {
  // If running on localhost, use localhost API
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  // If running on network IP, assume API is on the same IP at port 8000
  return `http://${window.location.hostname}:8000`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Ideally redirect to login, but let's let the App component handle it via state
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
