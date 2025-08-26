// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a token on initial load
    const token = localStorage.getItem('authToken');
    if (token) {
      // If token exists, fetch user profile
      api.get('/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // If token is invalid, remove it
          localStorage.removeItem('authToken');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { access_token, user } = response.data;
    localStorage.setItem('authToken', access_token);
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const response = await api.post('/register', userData);
    const { access_token, user } = response.data;
    localStorage.setItem('authToken', access_token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};