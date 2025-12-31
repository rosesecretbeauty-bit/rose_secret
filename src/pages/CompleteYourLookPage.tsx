import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShoppingBag, Heart, Check, Zap, TrendingUp, Users, Star, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductCard } from '../components/products/ProductCard';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
import { trackFeatureUsage } from '../utils/analytics';
import { getProducts, Product } from '../api/products';

interface CuratedLook {
  id: number;
  name: string;
  description: string;
  occasion: string;
  season: string;
  style: string;
  image: string;
  products: (Product & { role: string })[];
  totalPrice: number;
  savings: number;
  popularity: number;
}

export function CompleteYourLookPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [curatedLooks, setCuratedLooks] = useState<CuratedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLook, setSelectedLook] = useState<CuratedLook | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showComparison, setShowComparison] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      generateLooks();
    }
  }, [products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ limit: 20, featured: true });
      setProducts(data.products || []);
    } catch (error: any) {
      console.error('Error loading products:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar productos'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLooks = () => {
    if (products.length < 5) return;
    
    // Generate curated looks from real products only (no mock data)
    const looks: CuratedLook[] = [];
    
    const look1Products = [
      { ...products[0], role: 'Fragancia Principal' },
      { ...products[Math.min(2, products.length - 1)], role: 'Cuidado Base' },
      { ...products[Math.min(4, products.length - 1)], role: 'Toque Final' }
    ].filter(p => p.id);
    
    if (look1Products.length === 3) {
      const totalPrice1 = look1Products.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : parseFloat(p.price?.toString() || '0')), 0);
      looks.push({
        id: 1,
        name: 'Elegancia Nocturna',
        description: 'Un look sofisticado perfecto para eventos especiales',
        occasion: 'Noche',
        season: 'Todo el año',
        style: 'Elegante',
        image: products[0]?.images?.[0] || '/placeholder-product.png',
        products: look1Products,
        totalPrice: totalPrice1,
        savings: Math.round(totalPrice1 * 0.15),
        popularity: 0
      });
    }
    
    const look2Products = [
      { ...products[1], role: 'Fragancia Ligera' },
      { ...products[Math.min(3, products.length - 1)], role: 'Hidratación' },
      { ...products[Math.min(5, products.length - 1)], role: 'Protección' }
    ].filter(p => p.id);
    
    if (look2Products.length === 3) {
      const totalPrice2 = look2Products.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : parseFloat(p.price?.toString() || '0')), 0);
      looks.push({
        id: 2,
        name: 'Frescura Diaria',
        description: 'Rutina ligera y refrescante para el día a día',
        occasion: 'Día',
        season: 'Primavera/Verano',
        style: 'Casual',
        image: products[1]?.images?.[0] || '/placeholder-product.png',
        products: look2Products,
        totalPrice: totalPrice2,
        savings: Math.round(totalPrice2 * 0.12),
        popularity: 0
      });
    }
    
    setCuratedLooks(looks);
    if (looks.length > 0) {
      setSelectedLook(looks[0]);
    }
  };

  useEffect(() => {
    trackFeatureUsage('complete_your_look', 'page_view');
  }, []);

  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const addSelectedToCart = () => {
    if (!selectedLook) return;
    let count = 0;
    selectedLook.products.forEach(product => {
      if (selectedProducts.has(product.id.toString())) {
        addItem(product, 1);
        count++;
      }
    });
    if (count > 0) {
      addToast({
        type: 'success',
        message: `${count} productos añadidos al carrito`
      });
      trackFeatureUsage('complete_your_look', 'add_to_cart');
    }
  };

  const addCompleteLook = () => {
    if (!selectedLook) return;
    selectedLook.products.forEach(product => {
      addItem(product, 1);
    });
    addToast({
      type: 'success',
      message: '¡Look completo añadido al carrito!'
    });
    trackFeatureUsage('complete_your_look', 'add_complete_look');
  };

  const selectedTotal = selectedLook ? selectedLook.products
    .filter(p => selectedProducts.has(p.id.toString()))
    .reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : parseFloat(p.price?.toString() || '0')), 0) : 0;

  const getProductImage = (images: string[] | undefined): string => {
    if (!images || images.length === 0) return '/placeholder-product.png';
    return images[0];
  };

  if (loading || !selectedLook || curatedLooks.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
    </div>;
  }
  return <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-20">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-purple-100/50" />
        <div className="container-custom relative z-10 px-4 sm:px-6">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500" />
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                Curado por Expertos
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Completa tu <span className="text-rose-600 italic">Look</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              Descubre combinaciones perfectas curadas por nuestros expertos en
              belleza. Cada look está diseñado para complementarse y realzar tu
              estilo único.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm px-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-rose-600" />
                </div>
                <span className="text-gray-600">+10K looks creados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-600">4.9★ valoración</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-600">Ahorra hasta 20%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-custom">
        {/* Look Selector */}
        <div className="mb-8 sm:mb-12 px-4 sm:px-0">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Selecciona tu Ocasión
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {curatedLooks.map((look, idx) => <motion.button key={look.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: idx * 0.1
          }} onClick={() => {
            setSelectedLook(look);
            setSelectedProducts(new Set());
          }} className={`relative group text-left rounded-2xl overflow-hidden transition-all ${selectedLook?.id === look.id ? 'ring-4 ring-rose-500 shadow-premium' : 'hover:shadow-lg'}`}>
                <div className="aspect-[4/3] relative">
                  <img src={look.image} alt={look.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {selectedLook?.id === look.id && <motion.div initial={{
                scale: 0
              }} animate={{
                scale: 1
              }} className="absolute top-4 right-4 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </motion.div>}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white">
                      {look.occasion}
                    </Badge>
                    <Badge className="bg-white/20 backdrop-blur-md border-white/30 text-white">
                      {look.style}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-1">
                    {look.name}
                  </h3>
                  <p className="text-sm text-gray-200 line-clamp-2">
                    {look.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
                    {look.popularity > 0 && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        {look.popularity}% popular
                      </span>
                    )}
                    <span className="font-bold">Ahorra ${look.savings}</span>
                  </div>
                </div>
              </motion.button>)}
          </div>
        </div>

        {/* Selected Look Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12 px-4 sm:px-0">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                Productos del Look
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowComparison(!showComparison)} className="text-xs sm:text-sm">
                {showComparison ? 'Ocultar' : 'Comparar'}
              </Button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {selectedLook.products.map((product, idx) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 transition-all ${
                    selectedProducts.has(product.id.toString()) ? 'border-rose-500 shadow-lg' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                      <img src={getProductImage(product.images)} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {product.role}
                          </Badge>
                          <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.brand}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xl sm:text-2xl font-bold text-gray-900">
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price?.toString() || '0').toFixed(2)}
                          </div>
                          {product.compare_at_price && (
                            <div className="text-xs sm:text-sm text-gray-400 line-through">
                              ${typeof product.compare_at_price === 'number' ? product.compare_at_price.toFixed(2) : parseFloat(product.compare_at_price?.toString() || '0').toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <Button 
                          size="sm" 
                          variant={selectedProducts.has(product.id.toString()) ? 'primary' : 'outline'} 
                          onClick={() => toggleProduct(product.id.toString())} 
                          leftIcon={selectedProducts.has(product.id.toString()) ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
                          className="text-xs sm:text-sm"
                        >
                          {selectedProducts.has(product.id.toString()) ? 'Seleccionado' : 'Seleccionar'}
                        </Button>

                        <Link to={`/product/${product.id}`} className="flex-1 sm:flex-none">
                          <Button size="sm" variant="ghost" className="w-full sm:w-auto text-xs sm:text-sm">
                            Ver Detalles
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 sm:top-24 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-premium border border-gray-100">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Resumen del Look
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Productos seleccionados:
                  </span>
                  <span className="font-bold">
                    {selectedProducts.size} / {selectedLook?.products.length || 0}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-bold">${selectedTotal.toFixed(2)}</span>
                </div>

                {selectedLook && selectedProducts.size === selectedLook.products.length && <motion.div initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} className="flex justify-between text-sm bg-green-50 p-3 rounded-lg">
                    <span className="text-green-700 font-medium">
                      Ahorro por look completo:
                    </span>
                    <span className="font-bold text-green-700">
                      -${selectedLook.savings}
                    </span>
                  </motion.div>}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="font-bold text-2xl text-gray-900">
                      $
                      {(selectedTotal - (selectedLook && selectedProducts.size === selectedLook.products.length ? selectedLook.savings : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button fullWidth size="lg" onClick={addCompleteLook} leftIcon={<ShoppingBag className="w-5 h-5" />} disabled={selectedProducts.size === 0}>
                  Añadir Look Completo
                </Button>

                {selectedLook && selectedProducts.size > 0 && selectedProducts.size < selectedLook.products.length && <Button fullWidth size="lg" variant="outline" onClick={addSelectedToCart}>
                      Añadir Seleccionados ({selectedProducts.size})
                    </Button>}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Envío gratis en pedidos +$150</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Devoluciones en 30 días</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Muestras gratis incluidas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why This Look Works */}
        <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-3xl p-8 md:p-12 mb-12">
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6 text-center">
            ¿Por qué funciona este look?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Armonía Olfativa</h3>
              <p className="text-gray-600 text-sm">
                Las notas se complementan perfectamente sin competir entre sí
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Curado por Expertos
              </h3>
              <p className="text-gray-600 text-sm">
                Seleccionado por perfumistas y especialistas en belleza
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Probado y Amado</h3>
              <p className="text-gray-600 text-sm">
                Miles de clientes han creado este look con resultados increíbles
              </p>
            </div>
          </div>
        </div>

        {/* Related Looks */}
        <div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 text-center">
            Otros Looks que te Pueden Gustar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {curatedLooks.filter(l => l.id !== selectedLook?.id).map(look => <Link key={look.id} to="#" onClick={e => {
            e.preventDefault();
            setSelectedLook(look);
            setSelectedProducts(new Set());
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-premium transition-all border border-gray-100">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img src={look.image} alt={look.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-serif text-2xl font-bold mb-2">
                        {look.name}
                      </h3>
                      <p className="text-sm text-gray-200">
                        {look.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">Desde</span>
                      <div className="text-2xl font-bold text-gray-900">
                        ${(look.totalPrice - look.savings).toFixed(2)}
                      </div>
                    </div>
                      <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Ver Look
                      </Button>
                    </div>
                  </div>
                </Link>)}
          </div>
        </div>
      </div>
    </div>;
}