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

// Remove the local API_URL, handleResponse, and api object definition
// const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// // Helper function to handle API responses
// const handleResponse = async (response) => {
//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.detail || 'Something went wrong');
//   }
//   return response.json();
// };

// // Basic API methods
// const api = {
//   get: async (endpoint, params = {}) => {
//     const url = new URL(`${API_URL}${endpoint}`);
//     Object.keys(params).forEach(key => {
//       // Handle array parameters correctly (e.g., jobTypes=type1&jobTypes=type2)
//       if (Array.isArray(params[key])) {
//         params[key].forEach(item => url.searchParams.append(key, item));
//       } else if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
//         url.searchParams.append(key, params[key]);
//       }
//     });

//     // --- Add console log here ---
//     console.log('Fetching from:', url.toString());
//     // ---------------------------

//     const response = await fetch(url.toString());
//     return handleResponse(response);
//   },

//   // ... rest of the existing api object methods ...
// };

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/token/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },

  logout: () => {
    // Handled by AuthContext
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
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token');
    const response = await api.post('/token/refresh/', { refresh });
    return response.data;
  },
};

// Jobs API

export const jobsAPI = {
  /**
   * Fetches all jobs based on optional filters
   * @async
   * @param {Object} [filters={}] - Optional query parameters to filter jobs
   * @returns {Promise<Array>} Array of job objects
   */
  getAll: async (filters = {}) => {
    try {
      //Sends a GET request to the jobs endpoint with optional filters
      const response = await api.get('/jobs/', { params: filters });
      return response.data;
      //Preventing any errors during the API call
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  /**
   * Retrieves a specific job by ID
   * @async
   * @param {string|number} id - The unique identifier of the job
   * @returns {Promise<Object>} The job object
   * @throws {Error} If the API request fails
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new job listing
   * @async
   * @param {Object} jobData - The job data to be created
   * @returns {Promise<Object>} The created job object
   * @throws {Error} If the API request fails
   */
  create: async (jobData) => {
    try {
      const response = await api.post('/jobs/', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  /**
   * Updates an existing job listing
   * @async
   * @param {string|number} id - The unique identifier of the job to update
   * @param {Object} jobData - The job data to be updated
   * @returns {Promise<Object>} The updated job object
   * @throws {Error} If the API request fails
   */
  update: async (id, jobData) => {
    try {
      const response = await api.put(`/jobs/${id}/`, jobData);
      return response.data;
    } catch (error) {
      console.error(`Error updating job with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a specific job
   * @async
   * @param {string|number} id - The unique identifier of the job to delete
   * @returns {Promise<Object>} Response data from the server
   * @throws {Error} If the API request fails
   */
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
      return response.data; // Assuming backend returns data on successful application
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
      return response.data;
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
      return response.data; // Assuming backend returns data on successful update
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  getReferences: async () => {
    try {
      const response = await api.get('/profile/references/');
      return response.data; // Assuming backend returns data
    } catch (error) {
      console.error('Error fetching references:', error);
      throw error;
    }
  },

  addReference: async (referenceData) => {
    try {
      const response = await api.post('/profile/references/add/', referenceData);
      return response.data; // Assuming backend returns data
    } catch (error) {
      console.error('Error adding reference:', error);
      throw error;
    }
  },

  deleteReference: async (referenceId) => {
    try {
      const response = await api.delete(`/profile/references/${referenceId}/delete/`);
      return response.data; // Assuming backend returns data
    } catch (error) {
      console.error(`Error deleting reference with id ${referenceId}:`, error);
      throw error;
    }
  },

  getEducation: async () => {
    try {
      const response = await api.get('/profile/education/');
      return response.data; // Assuming backend returns data
    } catch (error) {
      console.error('Error fetching education:', error);
      throw error;
    }
  },

  addEducation: async (educationData) => {
    try {
      const response = await api.post('/profile/education/add/', educationData);
      return response.data; // Assuming backend returns data
    } catch (error) {
      console.error('Error adding education:', error);
      throw error;
    }
  },

  deleteEducation: async (educationId) => {
    try {
      const response = await api.delete(`/profile/education/${educationId}/delete/`);
      return response.data; // Assuming backend returns data
    } catch (error) {
      console.error(`Error deleting education with id ${educationId}:`, error);
      throw error;
    }
  },
};

// Admin API
export const adminAPI = {
  getPendingJobs: async (filters = {}) => {
    try {
      const response = await api.get('/admin/jobs/', { params: filters });
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

  getUserInfo: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user info for id ${userId}:`, error);
      throw error;
    }
  },
};

// Favorite Jobs API
export const favoriteJobsAPI = {
  toggleFavorite: async (jobId) => {
    try {
      const response = await api.post('/favorite-job/', { job_id: jobId });
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite job:', error);
      throw error;
    }
  },

  getFavorited: async () => {
    try {
      const response = await api.get('/favorited-jobs/');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorited jobs:', error);
      throw error;
    }
  },
};

// Remove default export of the local api instance
// export default api;