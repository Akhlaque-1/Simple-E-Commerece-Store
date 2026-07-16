import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure Axios
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5000' : '');

// Set up default axios configurations for proxying and credential sending
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check login status on app load/refresh
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await axios.get('/api/auth/profile');
        setUser(data);
      } catch (err) {
        // User not logged in (e.g. 401), ignore error for initial load
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      setUser(data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, role = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password, role });
      setUser(data);
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed. Please check your input.';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
