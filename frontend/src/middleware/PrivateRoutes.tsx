import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { Role } from '../types/auth';

interface Props {
  allowedRoles?: string[];
}

const PrivateRoutes: React.FC<Props> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) return <Navigate to="/login" />;

  // Check role authorization if allowedRoles is provided
  if (allowedRoles && user) {
    const userRoleName = typeof user.role === 'object' ? (user.role as Role).name : user.role;
    if (!allowedRoles.includes(userRoleName)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PrivateRoutes;
