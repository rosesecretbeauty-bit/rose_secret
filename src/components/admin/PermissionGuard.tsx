import React from 'react';
import { usePermissionsStore, Module, Action } from '../../stores/permissionsStore';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
interface PermissionGuardProps {
  module: Module;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showError?: boolean;
}
export function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
  showError = false
}: PermissionGuardProps) {
  const hasPermission = usePermissionsStore(state => state.hasPermission);
  const allowed = hasPermission(module, action);
  if (allowed) {
    return <>{children}</>;
  }
  if (showError) {
    return <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <div className="p-3 bg-red-100 rounded-full mb-4">
          <ShieldAlert className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-red-900 mb-2">Acceso Denegado</h3>
        <p className="text-red-600 max-w-md">
          No tienes permisos suficientes para realizar esta acción ({action} en{' '}
          {module}). Contacta al administrador si crees que esto es un error.
        </p>
      </motion.div>;
  }
  return <>{fallback}</>;
}