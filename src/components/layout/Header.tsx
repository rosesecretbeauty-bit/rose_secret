import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, LayoutDashboard, Video, Sparkles, Camera, LogOut, Settings, ChevronRight } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import { useSearchStore } from '../../stores/searchStore';
import { NotificationCenter } from '../ui/NotificationCenter';
import { Logo } from '../branding/Logo';
import { MegaMenu } from './MegaMenu';
import { FlashSaleBanner } from '../marketing/FlashSaleBanner';
import { Tooltip } from '../ui/Tooltip';
import { useAppSetting } from '../../hooks/useAppSettings';

// Componente para mostrar el nombre de la plataforma
function PlatformName() {
  const { value: platformName } = useAppSetting('platform_name');
  const { value: platformTagline } = useAppSetting('platform_tagline');
  const finalName = platformName || 'Rose Secret';
  const finalTagline = platformTagline || 'El poder de consentirte';
  
  return (
    <div className="hidden sm:block">
      <h1 className="font-serif text-xl font-bold text-stone-900 leading-none tracking-tight">
        {finalName}
      </h1>
      <p className="text-[10px] text-stone-500 italic tracking-wide">
        {finalTagline}
      </p>
    </div>
  );
}

export function Header() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartItemCount = useCartStore(state => state.getItemCount());
  const wishlistCount = useWishlistStore(state => state.items.length);
  const {
    user,
    isAuthenticated,
    logout,
    isAdmin
  } = useAuthStore();
  const openSearch = useSearchStore(state => state.openSearch);
  const toggleCart = useCartStore(state => state.toggleCart);
  const {
    scrollY
  } = useScroll();
  // Robust scroll handling
  useMotionValueEvent(scrollY, 'change', latest => {
    const previous = scrollY.getPrevious() || 0;
    setIsScrolled(latest > 20);
    // Hide on scroll down past 150px, show on scroll up
    if (latest > 150 && latest > previous) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };
  // Close menus when clicking outside
  useEffect(() => {
    if (isMegaMenuOpen || isUserMenuOpen) {
      const handleClickOutside = () => {
        setIsMegaMenuOpen(false);
        setIsUserMenuOpen(false);
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMegaMenuOpen, isUserMenuOpen]);
  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  return <>
      <FlashSaleBanner />

      <motion.header initial={{
      y: 0
    }} animate={{
      y: isHidden ? '-100%' : 0
    }} transition={{
      duration: 0.3,
      ease: 'easeInOut'
    }} className={`sticky top-0 z-[50] w-full transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-stone-100' : 'bg-white border-b border-transparent'}`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-1.5 -ml-1 hover:bg-stone-100 rounded-full transition-colors" aria-label="Menu">
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? <motion.div key="close" initial={{
                rotate: -90,
                opacity: 0
              }} animate={{
                rotate: 0,
                opacity: 1
              }} exit={{
                rotate: 90,
                opacity: 0
              }} transition={{
                duration: 0.2
              }}>
                    <X className="h-6 w-6 text-stone-900" />
                  </motion.div> : <motion.div key="menu" initial={{
                rotate: 90,
                opacity: 0
              }} animate={{
                rotate: 0,
                opacity: 1
              }} exit={{
                rotate: -90,
                opacity: 0
              }} transition={{
                duration: 0.2
              }}>
                    <Menu className="h-6 w-6 text-stone-900" />
                  </motion.div>}
              </AnimatePresence>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Logo size="md" animated linkTo="/" />
              <PlatformName />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors relative group">
                Inicio
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-600 transition-all duration-300 group-hover:w-full" />
              </Link>

              <div className="relative" onMouseEnter={() => setIsMegaMenuOpen(true)}>
                <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${isMegaMenuOpen ? 'text-rose-600' : 'text-stone-600 hover:text-rose-600'}`} onClick={e => {
                e.stopPropagation();
                setIsMegaMenuOpen(!isMegaMenuOpen);
              }}>
                  Explorar
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <Link to="/new-arrivals" className="text-sm font-medium text-stone-600 hover:text-rose-600 transition-colors relative group">
                Novedades
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-600 transition-all duration-300 group-hover:w-full" />
              </Link>

              <Link to="/sale" className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors">
                Ofertas
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthenticated && isAdmin() && <Link to="/admin" className="hidden lg:block">
                  <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all font-medium text-xs">
                    <LayoutDashboard className="h-3 w-3" />
                    <span>Admin</span>
                  </motion.button>
                </Link>}

              <Tooltip content="Buscar">
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={openSearch} className="p-1.5 sm:p-2 hover:bg-stone-100 rounded-full transition-colors hidden sm:block" aria-label="Buscar">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-stone-600" />
                </motion.button>
              </Tooltip>

              <Tooltip content="Favoritos">
                <Link to="/wishlist">
                  <motion.button whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }} className="relative p-1.5 sm:p-2 hover:bg-stone-100 rounded-full transition-colors hidden sm:block" aria-label="Favoritos">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-stone-600" />
                    {wishlistCount > 0 && <motion.span initial={{
                    scale: 0
                  }} animate={{
                    scale: 1
                  }} className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {wishlistCount}
                      </motion.span>}
                  </motion.button>
                </Link>
              </Tooltip>

              <Tooltip content="Carrito">
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={toggleCart} className="relative p-1.5 sm:p-2 hover:bg-stone-100 rounded-full transition-colors" aria-label="Carrito">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-stone-600" />
                  {cartItemCount > 0 && <motion.span initial={{
                  scale: 0
                }} animate={{
                  scale: 1
                }} className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {cartItemCount}
                    </motion.span>}
                </motion.button>
              </Tooltip>

              {isAuthenticated && (
                <div className="hidden sm:block">
                  <NotificationCenter />
                </div>
              )}

              <div className="relative hidden sm:block">
                <motion.button whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={e => {
                e.stopPropagation();
                setIsUserMenuOpen(!isUserMenuOpen);
              }} className="flex items-center gap-2 p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <User className="h-5 w-5 text-stone-600" />
                  {isAuthenticated && <ChevronDown className={`h-4 w-4 text-stone-600 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />}
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && <motion.div initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }} animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }} exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }} transition={{
                  duration: 0.2
                }} className="absolute right-0 mt-2 w-56 sm:w-64 lg:w-72 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-premium border border-stone-100 dark:border-gray-700 py-2 overflow-hidden z-[55]" onClick={e => e.stopPropagation()}>
                      {isAuthenticated ? <>
                          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-100 dark:border-gray-700 bg-stone-50/50 dark:bg-gray-700/50">
                            <p className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                              {user?.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-stone-500 dark:text-gray-400 truncate mt-0.5">
                              {user?.email}
                            </p>
                            {user?.role === 'admin' && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-stone-900 dark:bg-stone-700 text-white text-[9px] sm:text-[10px] font-semibold rounded uppercase tracking-wider">
                                Admin
                              </span>
                            )}
                          </div>

                          <div className="py-1 sm:py-2">
                            {isAdmin() && (
                              <Link 
                                to="/admin" 
                                onClick={() => setIsUserMenuOpen(false)} 
                                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-stone-600 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-700 hover:text-stone-900 dark:hover:text-white transition-colors"
                              >
                                <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">Panel de Administración</span>
                              </Link>
                            )}
                            <Link 
                              to="/account" 
                              onClick={() => setIsUserMenuOpen(false)} 
                              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-stone-600 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-700 hover:text-stone-900 dark:hover:text-white transition-colors"
                            >
                              <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">Mi Cuenta</span>
                            </Link>
                            <Link 
                              to="/account/orders" 
                              onClick={() => setIsUserMenuOpen(false)} 
                              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-stone-600 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-700 hover:text-stone-900 dark:hover:text-white transition-colors"
                            >
                              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">Mis Pedidos</span>
                            </Link>
                            <Link 
                              to="/wishlist" 
                              onClick={() => setIsUserMenuOpen(false)} 
                              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-stone-600 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-gray-700 hover:text-stone-900 dark:hover:text-white transition-colors"
                            >
                              <Heart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              Favoritos
                            </Link>
                          </div>

                          <div className="border-t border-stone-100 py-2">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                              <LogOut className="h-4 w-4" />
                              Cerrar Sesión
                            </button>
                          </div>
                        </> : <div className="p-2 space-y-2">
                          <Link to="/login" onClick={() => setIsUserMenuOpen(false)} className="block w-full text-center px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors">
                            Iniciar Sesión
                          </Link>
                          <Link to="/register" onClick={() => setIsUserMenuOpen(false)} className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors">
                            Crear Cuenta
                          </Link>
                        </div>}
                    </motion.div>}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* MegaMenu */}
        <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />

        {/* Mobile Menu - Full Screen Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && <motion.div initial={{
          opacity: 0,
          x: '100%'
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: '100%'
        }} transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200
        }} className="fixed inset-0 z-50 bg-white md:hidden flex flex-col">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Logo size="sm" />
                  <span className="font-serif font-bold text-lg">Menu</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="h-6 w-6 text-stone-900" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-stone-100">
                <div className="relative" onClick={() => {
              setIsMobileMenuOpen(false);
              openSearch();
            }}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <div className="w-full pl-10 pr-4 py-3 bg-stone-50 rounded-xl text-sm text-stone-500">
                    Buscar productos...
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="space-y-2">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                    <span className="font-medium text-lg text-stone-900">
                      Inicio
                    </span>
                    <ChevronRight className="h-5 w-5 text-stone-400" />
                  </Link>
                  <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                    <span className="font-medium text-lg text-stone-900">
                      Tienda
                    </span>
                    <ChevronRight className="h-5 w-5 text-stone-400" />
                  </Link>
                  <Link to="/new-arrivals" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors">
                    <span className="font-medium text-lg text-stone-900">
                      Novedades
                    </span>
                    <ChevronRight className="h-5 w-5 text-stone-400" />
                  </Link>
                  <Link to="/sale" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between p-3 rounded-xl hover:bg-rose-50 transition-colors">
                    <span className="font-bold text-lg text-rose-600">
                      Ofertas
                    </span>
                    <ChevronRight className="h-5 w-5 text-rose-400" />
                  </Link>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <p className="px-3 text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                    Experiencias
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/live-shopping" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl gap-2 hover:bg-rose-50 transition-colors">
                      <Video className="h-6 w-6 text-rose-500" />
                      <span className="text-xs font-medium text-center">
                        Live Shopping
                      </span>
                    </Link>
                    <Link to="/virtual-try-on" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl gap-2 hover:bg-rose-50 transition-colors">
                      <Camera className="h-6 w-6 text-rose-500" />
                      <span className="text-xs font-medium text-center">
                        Virtual Try-On
                      </span>
                    </Link>
                    <Link to="/style-quiz" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl gap-2 hover:bg-rose-50 transition-colors">
                      <Sparkles className="h-6 w-6 text-rose-500" />
                      <span className="text-xs font-medium text-center">
                        Style Quiz
                      </span>
                    </Link>
                    <Link to="/ai-shopper" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-stone-50 rounded-xl gap-2 hover:bg-rose-50 transition-colors">
                      <ShoppingBag className="h-6 w-6 text-rose-500" />
                      <span className="text-xs font-medium text-center">
                        AI Shopper
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-stone-100 bg-stone-50">
                {isAuthenticated ? <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <User className="h-5 w-5 text-stone-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-stone-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link to="/account" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-3 px-4 bg-white border border-stone-200 rounded-xl text-center text-sm font-medium text-stone-900">
                      Mi Cuenta
                    </Link>
                    <button onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }} className="block w-full py-3 px-4 bg-white border border-red-100 text-red-600 rounded-xl text-center text-sm font-medium">
                      Cerrar Sesión
                    </button>
                  </div> : <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center px-4 py-3 text-sm font-medium text-stone-900 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors">
                      Iniciar Sesión
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors">
                      Crear Cuenta
                    </Link>
                  </div>}
              </div>
            </motion.div>}
        </AnimatePresence>
      </motion.header>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" />}
      </AnimatePresence>
    </>;
}