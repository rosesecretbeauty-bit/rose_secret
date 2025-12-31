import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function NotFoundPage() {
  return <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center p-4">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="text-center max-w-md">
        {/* 404 Illustration */}
        <motion.div initial={{
        scale: 0.8
      }} animate={{
        scale: 1
      }} transition={{
        delay: 0.1
      }} className="mb-8">
          <div className="text-9xl font-serif font-bold text-rose-600 opacity-20">
            404
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.2
      }}>
          <h1 className="font-serif text-3xl font-medium text-gray-900 mb-4">
            Página No Encontrada
          </h1>
          <p className="text-gray-600 mb-8">
            No pudimos encontrar la página que buscas. Puede que haya sido
            movida o no exista.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button size="lg">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
            <Link to="/shop">
              <Button size="lg" variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Explorar Productos
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Suggestions */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.3
      }} className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Páginas populares:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/shop" className="text-rose-600 hover:text-rose-700">
              Ver Todo
            </Link>
            <Link to="/shop?category=perfumes" className="text-rose-600 hover:text-rose-700">
              Perfumes
            </Link>
            <Link to="/shop?category=cosmetics" className="text-rose-600 hover:text-rose-700">
              Cosméticos
            </Link>
            <Link to="/account" className="text-rose-600 hover:text-rose-700">
              Mi Cuenta
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>;
}