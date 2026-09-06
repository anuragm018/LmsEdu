import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edusphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Sync user profile & role from database on app load
  useEffect(() => {
    const syncProfile = async () => {
      const saved = localStorage.getItem('edusphere_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.token) {
            const res = await API.get('/auth/profile');
            const userData = res.data.user || res.data;
            if (userData && userData.role) {
              const freshUser = { ...parsed, ...userData };
              delete freshUser.success;
              setUser(freshUser);
              localStorage.setItem('edusphere_user', JSON.stringify(freshUser));
            }
          }
        } catch (err) {
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      }
    };
    syncProfile();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      
      // Enforce isVerified check on login
      if (res.data && res.data.isVerified === false) {
        setLoading(false);
        return {
          success: false,
          isUnverified: true,
          email: res.data.email,
          message: 'Your email address is not verified yet. Please enter your 6-digit OTP code.'
        };
      }

      setUser(res.data);
      localStorage.setItem('edusphere_user', JSON.stringify(res.data));
      setLoading(false);
      return { success: true, user: res.data };
    } catch (err) {
      setLoading(false);
      const isUnverified = err.response?.data?.isVerified === false;
      return { 
        success: false, 
        isUnverified,
        email: err.response?.data?.email || email,
        message: err.response?.data?.message || 'Login failed. Please check credentials.' 
      };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', userData);
      // Registration creates unverified user - do NOT log in yet
      setLoading(false);
      return { 
        success: true, 
        email: userData.email,
        role: userData.role,
        message: res.data.message 
      };
    } catch (err) {
      setLoading(false);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed.' 
      };
    }
  };

  const setVerifiedUserSession = (userData) => {
    setUser(userData);
    localStorage.setItem('edusphere_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('edusphere_user');
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await API.put('/auth/profile', updatedData);
      const updated = { ...user, ...res.data };
      // Remove 'success' flag from user state
      delete updated.success;
      setUser(updated);
      localStorage.setItem('edusphere_user', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, setVerifiedUserSession, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
