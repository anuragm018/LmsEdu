import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their own valid dashboard
    if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
    if (user.role === 'instructor') return <Navigate to="/dashboard/instructor" replace />;
    return <Navigate to="/dashboard/student" replace />;
  }

  return <Outlet />;
};
