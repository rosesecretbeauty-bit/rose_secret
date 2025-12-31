import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Scan, CreditCard, DollarSign, Percent, Trash2, Plus, Minus, Printer, Check } from 'lucide-react';
import { usePOSStore } from '../stores/posStore';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToastStore } from '../stores/toastStore';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { getProductImage } from '../utils/productUtils';

export function POSSystem() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const {
    cart,
    searchQuery,
    paymentMethod,
    discount,
    setSearchQuery,
    addToCart,
    removeFromCart,
    updateQuantity,
    setPaymentMethod,
    setDiscount,
    getSubtotal,
    getTotal,
    completeSale
  } = usePOSStore();
  const addToast = useToastStore(state => state.addToast);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const data = await getProducts({ limit: 50 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.slice(0, 8);
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, products]);
  const handleCompleteSale = () => {
    if (!paymentMethod) {
      addToast({
        type: 'error',
        message: 'Selecciona un método de pago'
      });
      return;
    }
    if (cart.length === 0) {
      addToast({
        type: 'error',
        message: 'El carrito está vacío'
      });
      return;
    }
    completeSale();
    setShowPayment(false);
    addToast({
      type: 'success',
      message: '¡Venta completada exitosamente!'
    });
  };
  const subtotal = getSubtotal();
  const total = getTotal();
  const discountAmount = subtotal - total;
  if (isLoadingProducts) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PremiumLoader />
    </div>;
  }

  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-white mb-1">
                Rose Secret POS
              </h1>
              <p className="text-sm text-gray-400">
                Punto de Venta - Tienda Física
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Cajero</p>
                <p className="font-medium">María García</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                <span className="font-bold">MG</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Products Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Buscar producto o escanear código..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">
                  <Scan className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, index) => <motion.button key={product.id} initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: index * 0.05
            }} onClick={() => addToCart(product)} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-rose-500 transition-all group">
                  <div className="aspect-square bg-gray-900 rounded-lg mb-3 overflow-hidden">
                    <img src={getProductImage(product.images)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-medium text-sm text-white mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-serif font-bold text-rose-400">
                    ${product.price.toFixed(2)}
                  </p>
                </motion.button>)}
            </div>
          </div>

          {/* Cart Section */}
          <div className="w-96 bg-gray-800/50 backdrop-blur-sm border-l border-gray-700 flex flex-col">
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="font-serif text-xl font-bold mb-1">Carrito</h2>
              <p className="text-sm text-gray-400">
                {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <AnimatePresence>
                {cart.map(item => <motion.div key={item.id} initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -20
              }} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex gap-3 mb-3">
                      <div className="h-16 w-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={getProductImage(item.images)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-white mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-rose-400 font-semibold">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 font-medium">
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-serif font-bold text-white">
                        ${(typeof item.price === 'number' ? item.price : parseFloat(item.price?.toString() || '0')) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>)}
              </AnimatePresence>

              {cart.length === 0 && <div className="text-center py-12">
                  <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">Carrito vacío</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Busca y añade productos
                  </p>
                </div>}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && <div className="p-6 border-t border-gray-700 space-y-4">
                {/* Discount */}
                <div className="flex items-center gap-3">
                  <button onClick={() => setDiscount(discount > 0 ? 0 : 10)} className={`flex-1 p-3 rounded-lg border transition-all ${discount > 0 ? 'bg-rose-600 border-rose-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-rose-500'}`}>
                    <Percent className="h-5 w-5 mx-auto" />
                  </button>
                  <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} placeholder="0" className="w-20 px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-center text-white focus:outline-none focus:ring-2 focus:ring-rose-500" />
                  <span className="text-gray-400">%</span>
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && <div className="flex justify-between text-green-400">
                      <span>Descuento ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>}
                  <div className="flex justify-between text-2xl font-serif font-bold text-white pt-2 border-t border-gray-700">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button fullWidth size="lg" onClick={() => setShowPayment(true)} className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800">
                  Procesar Pago
                </Button>
              </div>}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setShowPayment(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }} exit={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
                <h2 className="font-serif text-2xl font-bold text-white mb-6">
                  Método de Pago
                </h2>

                <div className="space-y-3 mb-6">
                  {[{
                id: 'cash',
                label: 'Efectivo',
                icon: DollarSign
              }, {
                id: 'card',
                label: 'Tarjeta',
                icon: CreditCard
              }, {
                id: 'transfer',
                label: 'Transferencia',
                icon: Check
              }].map(method => <button key={method.id} onClick={() => setPaymentMethod(method.id as any)} className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === method.id ? 'bg-rose-600 border-rose-600 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-rose-500'}`}>
                      <method.icon className="h-6 w-6" />
                      <span className="font-medium">{method.label}</span>
                      {paymentMethod === method.id && <Check className="h-5 w-5 ml-auto" />}
                    </button>)}
                </div>

                <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-700">
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>Total a pagar</span>
                  </div>
                  <div className="text-3xl font-serif font-bold text-white">
                    ${total.toFixed(2)}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" fullWidth onClick={() => setShowPayment(false)} className="border-gray-700 text-gray-400 hover:bg-gray-900">
                    Cancelar
                  </Button>
                  <Button fullWidth onClick={handleCompleteSale} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Check className="mr-2 h-5 w-5" />
                    Confirmar Venta
                  </Button>
                </div>
              </motion.div>
            </div>
          </>}
      </AnimatePresence>
    </div>;
}