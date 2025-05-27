import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/user/');
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
  update: (data) => api.put('/profile/', data),
  getReferences: () => api.get('/profile/references/'),
  addReference: (data) => api.post('/profile/references/', data),
  getEducation: () => api.get('/profile/education/'),
  addEducation: (data) => api.post('/profile/education/', data),
};

export default api; 