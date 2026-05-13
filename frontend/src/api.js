import axios from 'axios';
import toast from 'react-hot-toast';

const normalizeApiBaseUrl = (url) => {
  const trimmed = (url || '').replace(/\/$/, '');

  if (!trimmed) {
    return 'http://localhost:5000/api';
  }

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for global error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - clear session and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('worker');
      window.location.href = '/login';
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

// Simple offline queue mechanism
export const saveOffline = (key, data) => {
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push(data);
  localStorage.setItem(key, JSON.stringify(existing));
};

export const syncOfflineData = async () => {
  if (!navigator.onLine) return;
  
  const offlineScreenings = JSON.parse(localStorage.getItem('offline_screenings') || '[]');
  if (offlineScreenings.length > 0) {
    for (const screening of offlineScreenings) {
      try {
        await api.post('/analyze', screening);
      } catch (e) {
        console.error('Failed to sync', e);
      }
    }
    localStorage.removeItem('offline_screenings');
  }
};

export default api;

window.addEventListener('online', syncOfflineData);
