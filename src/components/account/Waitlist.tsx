// ============================================
// Waitlist Component - Lista de Espera de Productos
// ============================================

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, X, Loader2, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useWaitlistStore } from '../../stores/waitlistStore';
import { useToastStore } from '../../stores/toastStore';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { getProductImage } from '../../utils/productUtils';

export function Waitlist() {
  const { items, loading, loadWaitlist, removeItem } = useWaitlistStore();
  const addToast = useToastStore(state => state.addToast);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);

  useEffect(() => {
    loadWaitlist();
  }, [loadWaitlist]);

  const handleRemove = async (id: number) => {
    try {
      await removeItem(id);
      addToast({
        type: 'success',
        message: 'Producto removido de tu lista de espera'
      });
      setDeletingId(null);
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al remover de lista de espera'
      });
      setDeletingId(null);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
          No estás esperando ningún producto actualmente
        </h3>
        <p className="text-gray-600 mb-6">
          Cuando agregues productos a tu lista de espera, aparecerán aquí
        </p>
        <Link to="/shop">
          <Button>
            <Package className="h-4 w-4 mr-2" /> Explorar Productos
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-medium">Your Waitlist</h2>
        <p className="text-sm text-gray-500">{items.length} producto{items.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-rose-200 transition-colors group"
          >
            <Link to={`/product/${item.product_id}`}>
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={item.image_url || getProductImage([])}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
                {item.notified && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Notified
                  </div>
                )}
              </div>
            </Link>
            
            <CardContent className="p-4">
              <Link to={`/product/${item.product_id}`}>
                <h3 className="font-bold text-gray-900 mb-1 hover:text-rose-600 transition-colors">
                  {item.product_name}
                </h3>
                {item.variant_name && (
                  <p className="text-sm text-gray-500 mb-2">{item.variant_name}</p>
                )}
                <p className="text-lg font-bold text-rose-600 mb-4">
                  ${item.price.toFixed(2)}
                </p>
              </Link>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Agregado {new Date(item.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setDeletingId(item.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            handleRemove(deletingId);
          }
        }}
        title="Remover de Lista de Espera"
        message="¿Estás seguro de que quieres remover este producto de tu lista de espera?"
        confirmText="Remover"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

