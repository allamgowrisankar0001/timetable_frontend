import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL ='https://timetable-backend-wwtx.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userAPI = {
  // Save user to MongoDB
  saveUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Get user by UID
  getUser: async (uid) => {
    const response = await api.get(`/users/${uid}`);
    return response.data;
  },
};

export const timetableAPI = {
  // Get all timetable entries for a user
  getEntries: async (userId) => {
    const response = await api.get(`/timetable/${userId}`);
    return response.data;
  },

  // Add new timetable entry
  addEntry: async (entryData) => {
    const response = await api.post('/timetable', entryData);
    return response.data;
  },

  // Update timetable entry
  updateEntry: async (entryId, updateData) => {
    const response = await api.put(`/timetable/${entryId}`, updateData);
    return response.data;
  },

  // Delete timetable entry
  deleteEntry: async (entryId) => {
    const response = await api.delete(`/timetable/${entryId}`);
    return response.data;
  },
};

export default api; 