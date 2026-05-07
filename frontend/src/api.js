import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

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

window.addEventListener('online', syncOfflineData);

export default api;
