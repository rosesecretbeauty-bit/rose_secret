import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
interface AdminLayoutProps {
  children: React.ReactNode;
}
export function AdminLayout({
  children
}: AdminLayoutProps) {
  const {
    logout
  } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <div className="flex h-screen bg-cream-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <CollapsibleSidebar />
      </div>

      {/* Sidebar - Mobile */}
      {isMobileMenuOpen && <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <motion.div initial={{
            x: -300
          }} animate={{
            x: 0
          }} exit={{
            x: -300
          }} className="absolute left-0 top-0 bottom-0 w-72 sm:w-80 bg-white shadow-2xl">
            <CollapsibleSidebar />
          </motion.div>
        </div>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 md:px-8 z-10">
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            </button>

            <div className="hidden md:flex relative w-64 lg:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
              <input type="text" placeholder="Buscar en todo el panel..." className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-100 focus:bg-white transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="relative p-2 sm:p-2.5 hover:bg-rose-50 rounded-xl text-gray-500 hover:text-rose-600 transition-colors">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-6 sm:h-8 w-px bg-gray-200 mx-1 sm:mx-2" />

            <button onClick={handleLogout} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
            <AdminBreadcrumbs />

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            ease: 'easeOut'
          }}>
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>;
}