import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
}
export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireManager = false
}: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isAdmin,
    isManager
  } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  if (requireManager && !isManager()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}