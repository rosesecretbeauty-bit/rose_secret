import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3, FileText, ChevronDown, ChevronRight, Tag, Percent, Ticket, Store, Shield, Bell, FileEdit, Search, BoxIcon, Smartphone, Mail, FileCode, Lock } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
interface SidebarItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}
interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}
export function CollapsibleSidebar() {
  const location = useLocation();
  const {
    theme
  } = useThemeStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Principal', 'Catálogo', 'Ventas', 'Sistema']);
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
  };
  const menuGroups: SidebarGroup[] = [{
    title: 'Principal',
    items: [{
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin'
    }]
  }, {
    title: 'Catálogo',
    items: [{
      icon: Package,
      label: 'Productos',
      path: '/admin/products'
    }, {
      icon: Tag,
      label: 'Categorías',
      path: '/admin/categories'
    }, {
      icon: BoxIcon,
      label: 'Inventario',
      path: '/admin/inventory'
    }]
  }, {
    title: 'Ventas',
    items: [{
      icon: ShoppingCart,
      label: 'Órdenes',
      path: '/admin/orders'
    }, {
      icon: Percent,
      label: 'Promociones',
      path: '/admin/promotions'
    }, {
      icon: Ticket,
      label: 'Cupones',
      path: '/admin/coupons'
    }]
  }, {
    title: 'Clientes',
    items: [{
      icon: Users,
      label: 'Usuarios',
      path: '/admin/users'
    }, {
      icon: BarChart3,
      label: 'Analíticas',
      path: '/admin/analytics'
    }]
  }, {
    title: 'Sistema',
    items: [{
      icon: Bell,
      label: 'Notificaciones',
      path: '/admin/notifications',
      badge: 3
    }, {
      icon: Shield,
      label: 'Roles',
      path: '/admin/roles'
    }, {
      icon: FileEdit,
      label: 'Contenido',
      path: '/admin/content'
    }, {
      icon: Search,
      label: 'Auditoría',
      path: '/admin/audit'
    }, {
      icon: FileText,
      label: 'Logs',
      path: '/admin/logs'
    },     {
      icon: Store,
      label: 'Configuración',
      path: '/admin/store-settings'
    }, {
      icon: Mail,
      label: 'Plantillas Email',
      path: '/admin/email-templates'
    }, {
      icon: FileCode,
      label: 'Config Email',
      path: '/admin/email-config'
    }, {
      icon: Lock,
      label: 'Seguridad',
      path: '/admin/security-settings'
    }, {
      icon: Smartphone,
      label: 'App Config',
      path: '/admin/app-config'
    }, {
      icon: Settings,
      label: 'Ajustes Admin',
      path: '/admin/settings'
    }]
  }];
  return <div className="h-full flex flex-col bg-white border-r border-gray-100 w-72 shadow-soft">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <span className="text-white font-serif font-bold text-xl">RS</span>
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-charcoal-900">
              Rose Secret
            </h1>
            <p className="text-xs text-rose-500 font-medium tracking-wide">
              ADMIN PANEL
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar">
        {menuGroups.map(group => <div key={group.title}>
            {group.title !== 'Principal' && <button onClick={() => toggleGroup(group.title)} className="flex items-center justify-between w-full px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-rose-500 transition-colors">
                {group.title}
                {expandedGroups.includes(group.title) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>}

            <AnimatePresence initial={false}>
              {(group.title === 'Principal' || expandedGroups.includes(group.title)) && <motion.div initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: 'auto',
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} transition={{
            duration: 0.2
          }} className="space-y-1 overflow-hidden">
                  {group.items.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return <Link key={item.path} to={item.path} className={`
                          relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                          ${isActive ? 'bg-rose-50 text-rose-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                        `}>
                        <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-rose-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        <span className="flex-1">{item.label}</span>

                        {item.badge && item.badge > 0 && <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                            {item.badge}
                          </span>}

                        {isActive && <motion.div layoutId="activeIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full" />}
                      </Link>;
            })}
                </motion.div>}
            </AnimatePresence>
          </div>)}
      </nav>

      {/* Footer User Profile */}
      <div className="p-4 border-t border-gray-50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-rose-50 transition-colors cursor-pointer group">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold border-2 border-white shadow-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 group-hover:text-rose-700 transition-colors">
              Admin User
            </p>
            <p className="text-xs text-gray-500 truncate">
              admin@rosesecret.com
            </p>
          </div>
        </div>
      </div>
    </div>;
}