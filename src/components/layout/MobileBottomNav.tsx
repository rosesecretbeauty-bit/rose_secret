import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useSearchStore } from '../../stores/searchStore';
export function MobileBottomNav() {
  const location = useLocation();
  const cartItemCount = useCartStore(state => state.getItemCount());
  const wishlistCount = useWishlistStore(state => state.items.length);
  const openSearch = useSearchStore(state => state.openSearch);
  const navItems = [{
    icon: Home,
    label: 'Inicio',
    path: '/',
    exact: true
  }, {
    icon: Search,
    label: 'Buscar',
    action: openSearch
  }, {
    icon: ShoppingBag,
    label: 'Carrito',
    path: '/cart',
    badge: cartItemCount
  }, {
    icon: Heart,
    label: 'Favoritos',
    path: '/wishlist',
    badge: wishlistCount
  }, {
    icon: User,
    label: 'Cuenta',
    path: '/account'
  }];
  const isActive = (path?: string, exact?: boolean) => {
    if (!path) return false;
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };
  return <motion.nav initial={{
    y: 100
  }} animate={{
    y: 0
  }} className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-premium-lg">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.path, item.exact);
        const content = <motion.div whileTap={{
          scale: 0.9
        }} className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors">
              <div className="relative">
                <Icon className={`h-6 w-6 transition-colors ${active ? 'text-rose-600' : 'text-gray-400'}`} />
                {item.badge !== undefined && item.badge > 0 && <motion.span initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} className="absolute -top-2 -right-2 h-5 w-5 bg-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {item.badge > 9 ? '9+' : item.badge}
                  </motion.span>}
              </div>
              <span className={`text-xs font-medium transition-colors ${active ? 'text-rose-600' : 'text-gray-500'}`}>
                {item.label}
              </span>

              {active && <motion.div layoutId="activeTab" className="absolute inset-0 bg-rose-50 rounded-xl -z-10" transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }} />}
            </motion.div>;
        return item.action ? <button key={item.label} onClick={item.action}>
              {content}
            </button> : <Link key={item.label} to={item.path!}>
              {content}
            </Link>;
      })}
      </div>
    </motion.nav>;
}