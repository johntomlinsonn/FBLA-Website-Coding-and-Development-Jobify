import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export the api instance so it can be used elsewhere
export { api };

// Add request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('/api/token/refresh/', {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear everything and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Explicitly set the Authorization header for the api instance immediately
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const profileResponse = await api.get('/profile/');
          setUser(profileResponse.data);
        } catch (error) {
          // If token is invalid or profile fetch fails, clear everything
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        // No token found, ensure header is not set and user is null
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await api.post('/token/', {
        username,
        password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      const profileResponse = await api.get('/profile/');
      setUser(profileResponse.data);

      navigate('/account');

      return profileResponse.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (first_name, last_name, email, username, password, isJobProvider) => {
    try {
      setLoading(true);
      const response = await api.post('/register/', {
        first_name,
        last_name,
        email,
        username,
        password,
        is_job_provider: isJobProvider,
      });
      // No need to set tokens or user here, as the Login component will handle the login after successful registration.
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 