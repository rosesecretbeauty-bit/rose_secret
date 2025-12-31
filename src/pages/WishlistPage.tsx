import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, Share2, Loader2, AlertCircle } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/products/ProductCard';
import { ShareWishlistModal } from '../components/wishlist/ShareWishlistModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Confetti } from '../components/ui/Confetti';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { Link } from 'react-router-dom';

export function WishlistPage() {
  const {
    items,
    removeItem,
    clearWishlist,
    loadWishlist
  } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const addToCart = useCartStore(state => state.addItem);
  const addToast = useToastStore(state => state.addToast);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const {
    ref,
    controls,
    variants
  } = useScrollReveal();

  // Cargar wishlist al montar el componente
  useEffect(() => {
    async function load() {
      if (!isAuthenticated) {
        setIsLoading(false);
        setError('Debes iniciar sesión para ver tu wishlist');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        await loadWishlist();
      } catch (err: any) {
        console.error('Error loading wishlist:', err);
        setError('Error al cargar tu wishlist. Por favor, intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isAuthenticated, loadWishlist]);

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product, 1);
      addToast({
        type: 'success',
        message: `${product.name} añadido al carrito`
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al añadir al carrito'
      });
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    try {
      await removeItem(productId);
      addToast({
        type: 'info',
        message: `${productName} eliminado de tu wishlist`
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al eliminar de la wishlist'
      });
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('¿Estás segura de que deseas eliminar todos los productos de tu wishlist?')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearWishlist();
      addToast({
        type: 'success',
        message: 'Wishlist limpiada exitosamente'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al limpiar la wishlist'
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <PremiumLoader />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Inicia sesión para ver tu wishlist
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Error state (otro tipo de error)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                Error al cargar wishlist
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <Button onClick={() => {
                setError(null);
                setIsLoading(true);
                loadWishlist().finally(() => setIsLoading(false));
              }}>
                Intentar de nuevo
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <EmptyState
            title="Tu wishlist está vacía"
            description="Guarda los productos que te encantan en tu wishlist. Revísalos cuando quieras y añádelos fácilmente al carrito."
            actionLabel="Comenzar a comprar"
            actionLink="/shop"
            icon={Heart}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">
              Mi Wishlist
            </h1>
            <p className="text-gray-500 mt-1">
              {items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsShareModalOpen(true)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartir Lista
            </Button>
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              disabled={isClearing}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 disabled:opacity-50"
            >
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpiar Todo
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={variants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {items.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} showQuickView={true} />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <ShareWishlistModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}