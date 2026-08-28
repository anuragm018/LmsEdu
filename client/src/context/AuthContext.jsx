import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edusphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

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
      setUser(res.data);
      localStorage.setItem('edusphere_user', JSON.stringify(res.data));
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
