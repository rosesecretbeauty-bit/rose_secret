import React, { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
export function AdminBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  // Map paths to readable names
  const pathNameMap: Record<string, string> = {
    admin: 'Dashboard',
    products: 'Productos',
    orders: 'Órdenes',
    users: 'Usuarios',
    categories: 'Categorías',
    promotions: 'Promociones',
    analytics: 'Analíticas',
    settings: 'Configuración',
    logs: 'Logs de Actividad'
  };
  if (pathnames.length === 0 || pathnames[0] !== 'admin') {
    return null;
  }
  return <nav className="flex items-center gap-2 text-sm mb-6">
      <Link to="/admin" className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
        <Home className="h-4 w-4" />
      </Link>

      {pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const displayName = pathNameMap[name] || name;
      // Skip 'admin' in breadcrumb display
      if (name === 'admin' && pathnames.length > 1) {
        return null;
      }
      return <Fragment key={routeTo}>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
            {isLast ? <motion.span initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} className="font-medium text-gray-900 dark:text-white">
                {displayName}
              </motion.span> : <Link to={routeTo} className="text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                {displayName}
              </Link>}
          </Fragment>;
    })}
    </nav>;
}