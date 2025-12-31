// ============================================
// Permission Protected Route
// ============================================
// Componente para proteger rutas con permisos específicos

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { usePermission } from '../../hooks/usePermission';
import { PremiumLoader } from '../ui/PremiumLoader';

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallbackPath?: string;
}

export function PermissionProtectedRoute({
  children,
  permission,
  permissions,
  requireAll = false,
  fallbackPath = '/',
}: PermissionProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { can, canAny, canAll, isLoading } = usePermission();

  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario es ADMIN, permitir acceso directo (bypass de permisos)
  // Esto asegura que los administradores siempre puedan acceder
  const userIsAdmin = isAdmin();

  // Mostrar loader mientras se cargan permisos (solo si no es admin)
  if (isLoading && !userIsAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PremiumLoader />
      </div>
    );
  }

  // Si es admin, permitir acceso sin verificar permisos específicos
  if (userIsAdmin) {
    return <>{children}</>;
  }

  // Verificar permiso único
  if (permission) {
    if (!can(permission)) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // Verificar múltiples permisos
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? canAll(permissions)
      : canAny(permissions);

    if (!hasAccess) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}

