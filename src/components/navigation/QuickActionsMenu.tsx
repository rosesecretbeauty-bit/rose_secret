import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ShoppingBag, Heart, User, Home, Sparkles, BookOpen } from 'lucide-react';
import { getProducts } from '../../api/products';
import { Product } from '../../types';

export function QuickActionsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const navigate = useNavigate();

  // Cargar productos cuando se abre el menú
  useEffect(() => {
    if (isOpen && products.length === 0 && !isLoadingProducts) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await getProducts({ limit: 20 });
      if (response.products) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Error loading products for search:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const actions = [{
    icon: Home,
    label: 'Ir a Inicio',
    path: '/',
    shortcut: 'G H'
  }, {
    icon: ShoppingBag,
    label: 'Ver Tienda',
    path: '/shop',
    shortcut: 'G S'
  }, {
    icon: Sparkles,
    label: 'AI Personal Shopper',
    path: '/ai-shopper',
    shortcut: 'G A'
  }, {
    icon: BookOpen,
    label: 'Diario Olfativo',
    path: '/scent-journal',
    shortcut: 'G J'
  }, {
    icon: Heart,
    label: 'Mis Favoritos',
    path: '/wishlist',
    shortcut: 'G W'
  }, {
    icon: User,
    label: 'Mi Cuenta',
    path: '/account',
    shortcut: 'G P'
  }];
  
  const filteredProducts = query ? products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.brand?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3) : [];
  const filteredActions = actions.filter(action => action.label.toLowerCase().includes(query.toLowerCase()));
  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: -20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: -20
      }} className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Escribe para buscar o escribe un comando..." value={query} onChange={e => setQuery(e.target.value)} autoFocus className="flex-1 text-lg outline-none placeholder:text-gray-400" />
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 font-medium">
                <span className="text-xs">ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {/* Products Section */}
              {filteredProducts.length > 0 && <div className="mb-4">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Productos
                  </h3>
                  {filteredProducts.map(product => <button key={product.id} onClick={() => handleSelect(`/product/${product.id}`)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-rose-50 rounded-lg group transition-colors text-left">
                      <img src={product.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-rose-700">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        ${product.price}
                      </span>
                    </button>)}
                </div>}

              {/* Actions Section */}
              <div>
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones Rápidas
                </h3>
                {filteredActions.map((action, idx) => <button key={idx} onClick={() => handleSelect(action.path)} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg group transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {action.label}
                    </span>
                    {action.shortcut && <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        {action.shortcut}
                      </span>}
                  </button>)}
              </div>

              {filteredProducts.length === 0 && filteredActions.length === 0 && <div className="py-12 text-center text-gray-500">
                    <Command className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No se encontraron resultados para "{query}"</p>
                  </div>}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <span className="font-bold">↑↓</span> navegar
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-bold">↵</span> seleccionar
                </span>
              </div>
              <span>Rose Secret Command</span>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}