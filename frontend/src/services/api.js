// import axios from 'axios'; // Remove direct axios import
import { api } from '../contexts/AuthContext'; // Import the configured api instance

// Remove the local API_URL and axios.create call
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// Remove the local request interceptor
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Auth API
export const authAPI = {
  login: async (credentials) => {
    // JWT login
    // Use the imported api instance
    const response = await api.post('/token/', credentials);
    // Token handling is now done in AuthContext, so no need to save here
    // localStorage.setItem('access', response.data.access);
    // localStorage.setItem('refresh', response.data.refresh);
    return response.data;
  },

  register: async (userData) => {
    // Use the imported api instance
    const response = await api.post('/register/', userData);
    return response.data;
  },

  logout: () => {
    // Token removal is now done in AuthContext
    // localStorage.removeItem('access');
    // localStorage.removeItem('refresh');
  },

  getCurrentUser: async () => {
    // Use the imported api instance
    const response = await api.get('/profile/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile/', profileData);
    return response.data;
  },

  refreshToken: async () => {
    // Token refresh logic is now in the api instance's response interceptor in AuthContext
    // This function might not be needed anymore if refresh is handled automatically
    // However, keeping it for now in case it's called directly elsewhere.
    const refresh = localStorage.getItem('refresh_token'); // Use refresh_token key from AuthContext
    if (!refresh) throw new Error('No refresh token');
    // Use the imported api instance (note: the response interceptor will handle saving the new token)
    const response = await api.post('/token/refresh/', { refresh });
    // localStorage.setItem('access', response.data.access); // Token saving is in interceptor
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  getAll: async () => {
    // Use the imported api instance
    const response = await api.get('/jobs/');
    return response.data;
  },

  getById: async (id) => {
    // Use the imported api instance
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
  },

  create: async (jobData) => {
    // Use the imported api instance
    const response = await api.post('/jobs/', jobData);
    return response.data;
  },

  update: async (id, jobData) => {
    // Use the imported api instance
    const response = await api.put(`/jobs/${id}/`, jobData);
    return response.data;
  },

  delete: async (id) => {
    // Use the imported api instance
    await api.delete(`/jobs/${id}/`);
  },
};

// Profile API
export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (profileData) => api.put('/profile/update/', profileData),
  getReferences: () => api.get('/profile/references/'),
  addReference: (referenceData) => api.post('/profile/references/add/', referenceData),
  deleteReference: (referenceId) => api.delete(`/profile/references/${referenceId}/`),
  getEducation: () => api.get('/profile/education/'),
  addEducation: (educationData) => api.post('/profile/education/add/', educationData),
  deleteEducation: (educationId) => api.delete(`/profile/education/${educationId}/`),
};

// Remove default export of the local api instance
// export default api; 