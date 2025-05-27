import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials) => {
    // JWT login
    const response = await api.post('/token/', credentials);
    // Save tokens
    localStorage.setItem('access', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  },

  getCurrentUser: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile/', profileData);
    return response.data;
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem('refresh');
    if (!refresh) throw new Error('No refresh token');
    const response = await api.post('/token/refresh/', { refresh });
    localStorage.setItem('access', response.data.access);
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  getAll: async () => {
    const response = await api.get('/jobs/');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
  },

  create: async (jobData) => {
    const response = await api.post('/jobs/', jobData);
    return response.data;
  },

  update: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}/`, jobData);
    return response.data;
  },

  delete: async (id) => {
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

export default api; 