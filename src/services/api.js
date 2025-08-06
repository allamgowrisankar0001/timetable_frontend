import axios from 'axios';

// Environment-based API configuration
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : 'https://timetable-backend-wwtx.onrender.com';

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', isDevelopment ? 'Development' : 'Production');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const userAPI = {
  // Save user to MongoDB
  saveUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  // Get user by UID
  getUser: async (uid) => {
    try {
      const response = await api.get(`/users/${uid}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },
};

export const timetableAPI = {
  // Get all timetable entries for a user
  getEntries: async (userId) => {
    try {
      const response = await api.get(`/timetable/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting entries:', error);
      throw error;
    }
  },

  // Add new timetable entry
  addEntry: async (entryData) => {
    try {
      const response = await api.post('/timetable', entryData);
      return response.data;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  },

  // Update timetable entry
  updateEntry: async (entryId, updateData) => {
    try {
      const response = await api.put(`/timetable/${entryId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },

  // Delete timetable entry
  deleteEntry: async (entryId) => {
    try {
      const response = await api.delete(`/timetable/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  },
};

export default api; 
