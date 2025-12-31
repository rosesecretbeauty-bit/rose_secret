import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
interface BreadcrumbItem {
  label: string;
  path: string;
}
export function Breadcrumbs() {
  const location = useLocation();
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{
      label: 'Inicio',
      path: '/'
    }];
    const pathMap: Record<string, string> = {
      shop: 'Tienda',
      product: 'Producto',
      cart: 'Carrito',
      checkout: 'Checkout',
      account: 'Mi Cuenta',
      wishlist: 'Favoritos',
      orders: 'Mis Pedidos',
      login: 'Iniciar Sesión',
      register: 'Registro',
      admin: 'Administración',
      pos: 'Punto de Venta'
    };
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
      // Skip product IDs in breadcrumbs
      if (index === 0 || !paths[index - 1].includes('product')) {
        breadcrumbs.push({
          label,
          path: currentPath
        });
      }
    });
    return breadcrumbs;
  };
  const breadcrumbs = getBreadcrumbs();
  if (breadcrumbs.length <= 1) return null;
  return <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return <motion.li key={crumb.path} initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.1
        }} className="flex items-center gap-2">
              {index === 0 ? <Link to={crumb.path} className="flex items-center gap-1.5 text-gray-500 hover:text-rose-600 transition-colors group">
                  <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">{crumb.label}</span>
                </Link> : isLast ? <span className="text-gray-900 font-medium">{crumb.label}</span> : <Link to={crumb.path} className="text-gray-500 hover:text-rose-600 transition-colors">
                  {crumb.label}
                </Link>}

              {!isLast && <ChevronRight className="h-4 w-4 text-gray-300" />}
            </motion.li>;
      })}
      </ol>
    </nav>;
}