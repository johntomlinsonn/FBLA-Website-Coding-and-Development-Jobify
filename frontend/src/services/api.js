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
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.searchTerm) {
        params.append('search', filters.searchTerm);
      }

      if (filters.jobTypes && filters.jobTypes.length > 0) {
        filters.jobTypes.forEach(type => params.append('job_type', type));
      }

      if (filters.salaryRange) {
        params.append('min_salary', filters.salaryRange[0]);
        params.append('max_salary', filters.salaryRange[1]);
      }

      if (filters.companies && filters.companies.length > 0) {
        filters.companies.forEach(company => params.append('company', company));
      }

      const url = `/jobs/?${params.toString()}`;
      const response = await api.get(url);
    return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
    } catch (error) {
      console.error(`Error fetching job with id ${id}:`, error);
      throw error;
    }
  },

  create: async (jobData) => {
    try {
    const response = await api.post('/jobs/', jobData);
    return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  update: async (id, jobData) => {
    try {
    const response = await api.put(`/jobs/${id}/`, jobData);
    return response.data;
    } catch (error) {
      console.error(`Error updating job with id ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/jobs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job with id ${id}:`, error);
      throw error;
    }
  },

  apply: async (jobId, formData) => {
    try {
      const response = await api.post(`/jobs/${jobId}/apply/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    try {
      const response = await api.get('/profile/');
      return response;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  update: async (profileData) => {
    try {
      const response = await api.put('/profile/update/', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  getReferences: async () => {
    try {
      const response = await api.get('/profile/references/');
      return response;
    } catch (error) {
      console.error('Error fetching references:', error);
      throw error;
    }
  },

  addReference: async (referenceData) => {
    try {
      const response = await api.post('/profile/references/add/', referenceData);
      return response;
    } catch (error) {
      console.error('Error adding reference:', error);
      throw error;
    }
  },

  deleteReference: async (referenceId) => {
    try {
      const response = await api.delete(`/profile/references/${referenceId}/`);
      return response;
    } catch (error) {
      console.error(`Error deleting reference with id ${referenceId}:`, error);
      throw error;
    }
  },

  getEducation: async () => {
    try {
      const response = await api.get('/profile/education/');
      return response;
    } catch (error) {
      console.error('Error fetching education:', error);
      throw error;
    }
  },

  addEducation: async (educationData) => {
    try {
      const response = await api.post('/profile/education/add/', educationData);
      return response;
    } catch (error) {
      console.error('Error adding education:', error);
      throw error;
    }
  },

  deleteEducation: async (educationId) => {
    try {
      const response = await api.delete(`/profile/education/${educationId}/`);
      return response;
    } catch (error) {
      console.error(`Error deleting education with id ${educationId}:`, error);
      throw error;
    }
  },
};

// Admin API (example - assuming you have admin related endpoints)
export const adminAPI = {
  getPendingJobs: async () => {
    try {
      const response = await api.get('/admin/jobs/pending/');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      throw error;
    }
  },

  approveJob: async (jobId) => {
    try {
      const response = await api.post(`/admin/jobs/${jobId}/approve/`);
      return response.data;
    } catch (error) {
      console.error(`Error approving job with id ${jobId}:`, error);
      throw error;
    }
  },

  denyJob: async (jobId) => {
    try {
      const response = await api.post(`/admin/jobs/${jobId}/deny/`);
      return response.data;
    } catch (error) {
      console.error(`Error denying job with id ${jobId}:`, error);
      throw error;
    }
  },

  deleteJob: async (jobId) => {
    try {
      const response = await api.delete(`/admin/jobs/${jobId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job with id ${jobId}:`, error);
      throw error;
    }
  },
};

// Remove default export of the local api instance
// export default api; 