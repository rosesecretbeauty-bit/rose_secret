import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Minus, Plus, Heart, Share2, ShieldCheck, Truck, RotateCcw, ChevronRight, Bell, Calendar, Eye, ShoppingBag, Check, ArrowRight, Clock } from 'lucide-react';
import { getProduct } from '../api/products';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useToastStore } from '../stores/toastStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductReviews } from '../components/products/ProductReviews';
import { FragranceNotesPyramid } from '../components/products/FragranceNotesPyramid';
import { ImageZoom } from '../components/products/ImageZoom';
import { SizeGuideModal } from '../components/products/SizeGuideModal';
import { ComparisonFloatingBar } from '../components/products/ComparisonFloatingBar';
import { useComparisonStore } from '../stores/comparisonStore';
import { WaitlistModal } from '../components/products/WaitlistModal';
import { SubscriptionModal } from '../components/products/SubscriptionModal';
import { SmartRecommendations } from '../components/products/SmartRecommendations';
import { Confetti } from '../components/ui/Confetti';
import { Tooltip } from '../components/ui/Tooltip';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GlassCard } from '../components/ui/GlassCard';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { useReviewsStore } from '../stores/reviewsStore';
import { trackEvent } from '../analytics/analyticsClient';
export function ProductDetailPage() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState<any>(null);
  // Marketing States
  const [viewersCount, setViewersCount] = useState(12);
  const [cartCount, setCartCount] = useState(5);
  
  // Reviews store
  const { loadStats, stats, loadingStats } = useReviewsStore();

  // Load product from API
  useEffect(() => {
    async function loadProduct() {
      if (!id) {
        setError('ID de producto no proporcionado');
        setIsLoading(false);
        return;
      }

      // Validar que el ID sea un número válido
      const productId = parseInt(id, 10);
      if (isNaN(productId) || productId <= 0) {
        setError('ID de producto inválido');
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setNotFound(false);
      
      try {
        const data = await getProduct(id);
        // Transform API product to match frontend Product type
        // El backend devuelve images array con estructura { url, is_primary, sort_order }
        let images: string[] = [];
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          // Ordenar por is_primary primero, luego por sort_order
          const sortedImages = [...data.images].sort((a: any, b: any) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.sort_order || 0) - (b.sort_order || 0);
          });
          images = sortedImages.map((img: any) => img.url || img.image_url || img);
        } else if (data.image_url) {
          // Fallback a image_url legacy
          images = [data.image_url];
        }
        
        // Si no hay imágenes, establecer índice en 0
        if (images.length > 0 && activeImageIndex >= images.length) {
          setActiveImageIndex(0);
        }
        
        // Procesar variantes si existen
        const variants = data.variants && Array.isArray(data.variants) ? data.variants : [];
        
        // Si hay variantes, seleccionar la default o la primera activa por defecto
        let defaultVariantId: number | null = null;
        if (variants.length > 0) {
          // Buscar variante marcada como default
          const defaultVariant = variants.find((v: any) => v.is_default === true && v.is_active !== false);
          if (defaultVariant) {
            defaultVariantId = defaultVariant.id;
          } else {
            // Si no hay default, usar la primera activa
            const activeVariant = variants.find((v: any) => v.is_active !== false);
            if (activeVariant) {
              defaultVariantId = activeVariant.id;
            }
          }
        }

        const productId = parseInt(id);
        
        // Cargar stats de reviews en paralelo
        loadStats(productId);

        const transformedProduct = {
          ...data,
          id: data.id.toString(),
          images: images,
          rating: data.rating || 0,
          reviews: data.reviews_count || 0,
          isNew: data.is_new || false,
          isBestSeller: data.is_bestseller || false,
          stock: data.stock || 0,
          variants: variants
        };
        setProduct(transformedProduct);
        setSelectedVariantId(defaultVariantId);
        setError(null);
        setNotFound(false);

        // Track product view
        trackEvent('VIEW_PRODUCT', {
          productId: transformedProduct.id,
          productName: transformedProduct.name,
          category: transformedProduct.category,
          price: transformedProduct.price,
          currency: 'USD',
          variantId: defaultVariantId || undefined,
        });
      } catch (error: any) {
        console.error('Error loading product:', error);
        
        // Determinar si es un error 404 (producto no encontrado)
        if (error.message?.includes('no encontrado') || 
            error.message?.includes('not found') ||
            error.response?.status === 404) {
          setNotFound(true);
          setError('Producto no encontrado');
        } else {
          setError(error.message || 'Error al cargar el producto');
        }
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id, loadStats]);
  const addToCart = useCartStore(state => state.addItem);
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist
  } = useWishlistStore();
  const addToast = useToastStore(state => state.addToast);
  const {
    addToComparison,
    isInComparison,
    removeFromComparison
  } = useComparisonStore();
  useEffect(() => {
    // Simulate live viewers
    const viewerInterval = setInterval(() => {
      setViewersCount(prev => Math.max(5, prev + Math.floor(Math.random() * 3) - 1));
    }, 4000);
    return () => {
      clearInterval(viewerInterval);
    };
  }, []);
  if (isLoading) {
    return <PremiumLoader fullScreen text="Preparando detalles..." />;
  }

  // Mostrar estado de error o producto no encontrado
  if (notFound || error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-rose-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto bg-rose-100 rounded-full flex items-center justify-center mb-4"
            >
              <ShoppingBag className="w-12 h-12 text-rose-600" />
            </motion.div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              {notFound ? 'Producto no encontrado' : 'Error al cargar'}
            </h2>
            <p className="text-gray-600">
              {notFound 
                ? 'El producto que buscas no existe o ya no está disponible.'
                : error || 'Ocurrió un error al cargar el producto.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/shop">
              <Button variant="primary" size="lg">
                Ver productos
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Ir al inicio
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }
  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInComparison(product.id);
  
  // Obtener variante seleccionada
  const selectedVariant = product.variants && selectedVariantId
    ? product.variants.find((v: any) => v.id === selectedVariantId)
    : null;

  // Calcular precio: usar precio de variante si existe, sino precio del producto
  const displayPrice = selectedVariant && selectedVariant.price !== null && selectedVariant.price !== undefined
    ? selectedVariant.price
    : product.price;

  // Calcular stock: usar stock de variante si existe, sino stock del producto
  const availableStock = selectedVariant && selectedVariant.stock !== null && selectedVariant.stock !== undefined
    ? selectedVariant.stock
    : (product.stock || 0);

  const isOutOfStock = availableStock === 0;
  const stockLevel = availableStock > 0 ? availableStock / 50 * 100 : 0;
  
  const handleAddToCart = async () => {
    // Validar que si hay variantes, se haya seleccionado una
    if (product.variants && product.variants.length > 0 && !selectedVariantId) {
      addToast({
        type: 'error',
        message: 'Por favor selecciona una variante'
      });
      return;
    }

    try {
      // Validar stock vía backend (fuente de verdad)
      const { validateStock } = await import('../api/products');
      const productId = parseInt(product.id);
      
      const stockValidation = await validateStock(
        productId,
        quantity,
        selectedVariantId || undefined
      );

      if (!stockValidation.success) {
        addToast({
          type: 'error',
          message: stockValidation.message || 'Stock insuficiente'
        });
        return;
      }

      // Obtener precio snapshot (precio actual del producto/variante)
      const priceSnapshot = selectedVariant && selectedVariant.price !== null && selectedVariant.price !== undefined
        ? selectedVariant.price
        : product.price;

      // Preparar datos para carrito con price_snapshot
      const productWithPrice = {
        ...product,
        price: priceSnapshot // Actualizar precio del producto con el snapshot
      };

      // Agregar al carrito con priceSnapshot
      addToCart(productWithPrice, quantity, undefined, undefined, selectedVariantId || undefined, priceSnapshot);
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      addToast({
        type: 'success',
        message: `¡${quantity} ${product.name} añadido al carrito!`
      });
    } catch (error: any) {
      // Manejar errores específicos
      if (error?.isNetworkError) {
        addToast({
          type: 'error',
          message: 'Servidor no disponible. Por favor, verifica tu conexión.'
        });
      } else {
        console.error('Error validando stock:', error);
        addToast({
          type: 'error',
          message: error.message || 'Error al validar stock. Por favor intenta de nuevo.'
        });
      }
    }
  };
  const toggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        addToast({
          type: 'info',
          message: 'Eliminado de favoritos'
        });
      } else {
        await addToWishlist(product);
        addToast({
          type: 'success',
          message: 'Añadido a favoritos'
        });
      }
    } catch (error: any) {
      // Manejar errores específicos
      if (error.message?.includes('sesión') || error.message?.includes('login')) {
        addToast({
          type: 'error',
          message: 'Debes iniciar sesión para usar la wishlist'
        });
      } else if (error.message?.includes('ya está')) {
        // Ya está en wishlist, no mostrar error
        return;
      } else {
        addToast({
          type: 'error',
          message: error.message || 'Error al actualizar wishlist'
        });
      }
    }
  };
  const toggleComparison = () => {
    if (isCompared) {
      removeFromComparison(product.id);
      addToast({
        type: 'info',
        message: 'Eliminado de comparación'
      });
    } else {
      addToComparison(product);
      addToast({
        type: 'success',
        message: 'Añadido a comparación'
      });
    }
  };
  return <div className="bg-white min-h-screen pb-20">
      <Confetti isActive={showConfetti} />

      {/* Breadcrumbs */}
      <div className="container-custom py-6">
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-rose-600 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
          <Link to="/shop" className="hover:text-rose-600 transition-colors">
            Tienda
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-300" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20">
          {/* Product Images - Luxury Gallery */}
          <div className="space-y-6">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="relative aspect-[3/4] bg-stone-50 rounded-2xl overflow-hidden shadow-soft group">
              <ImageZoom 
                images={product.images} 
                currentIndex={activeImageIndex}
                productName={product.name}
                onIndexChange={setActiveImageIndex}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isNew && <Badge variant="champagne">NUEVO</Badge>}
                {product.discount && <Badge className="bg-rose-600 text-white">
                    -{product.discount}%
                  </Badge>}
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-4 gap-4"
              >
                {product.images.map((img, idx) => {
                  const imageUrl = typeof img === 'string' ? img : (img.url || img.image_url || img);
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-rose-600 ring-2 ring-rose-100 scale-105'
                          : 'border-transparent hover:border-stone-200 hover:scale-102'
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} - Vista ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </motion.div>
            )}
            
            {/* Fallback si solo hay una imagen o ninguna */}
            {(!product.images || product.images.length === 0) && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay imágenes disponibles
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="mb-8 border-b border-stone-100 pb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-rose-600 font-medium uppercase tracking-widest text-xs">
                  {product.brand || 'Rose Secret'}
                </span>
                {product.isBestSeller && <Badge variant="secondary" className="text-[10px]">
                    BEST SELLER
                  </Badge>}
              </div>

              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-stone-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {(() => {
                    const productId = parseInt(product.id);
                    const reviewStats = stats[productId];
                    const averageRating = reviewStats?.average || product.rating || 0;
                    const totalReviews = reviewStats?.total || product.reviews || 0;
                    
                    return (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(averageRating) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : i < averageRating 
                                ? 'fill-yellow-200 text-yellow-200' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-sm font-medium text-stone-600 ml-2 border-b border-stone-300">
                          {totalReviews > 0 ? `${totalReviews} reseña${totalReviews !== 1 ? 's' : ''}` : 'Sin reseñas'}
                        </span>
                        {loadingStats[productId] && (
                          <span className="text-xs text-gray-400">(cargando...)</span>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-full animate-pulse">
                  <Eye className="w-3 h-3" />
                  <span>{viewersCount} personas viendo</span>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <span className="text-4xl font-light text-stone-900">
                  ${displayPrice.toFixed(2)}
                </span>
                {selectedVariant && selectedVariant.compare_at_price && (
                  <span className="text-xl text-stone-400 line-through mb-1">
                    ${parseFloat(selectedVariant.compare_at_price?.toString() || '0').toFixed(2)}
                  </span>
                )}
                {!selectedVariant && product.compare_at_price && (
                  <span className="text-xl text-stone-400 line-through mb-1">
                    ${parseFloat(product.compare_at_price?.toString() || '0').toFixed(2)}
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3
          }}>
              <p className="text-stone-600 mb-8 leading-relaxed text-lg font-light">
                {product.description}
              </p>

              {/* Stock Indicator - Scarcity */}
              {!isOutOfStock && availableStock < 20 && (
                <div className="mb-8 bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-orange-700 font-bold flex items-center gap-2">
                      <Clock className="w-3 h-3" /> ¡Casi agotado!
                    </span>
                    <span className="text-orange-600 font-medium">
                      Solo quedan {availableStock} unidad{availableStock !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  <ProgressBar progress={stockLevel} color="bg-orange-500" height={6} />
                </div>
              )}

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-stone-900">
                      Seleccionar Presentación
                    </span>
                    <button onClick={() => setShowSizeGuide(true)} className="text-xs text-stone-500 hover:text-rose-600 underline">
                      Guía de tallas
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.variants
                      .filter((v: any) => v.is_active !== false)
                      .map((variant: any) => {
                        const isSelected = selectedVariantId === variant.id;
                        const variantStock = variant.stock !== null && variant.stock !== undefined ? variant.stock : 0;
                        const isVariantOutOfStock = variantStock === 0;
                        const variantPrice = variant.price !== null && variant.price !== undefined ? variant.price : product.price;
                        
                        return (
                          <button
                            key={variant.id}
                            onClick={() => setSelectedVariantId(variant.id)}
                            disabled={isVariantOutOfStock}
                            className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                              isSelected
                                ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-200 shadow-sm'
                                : isVariantOutOfStock
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                : 'border-stone-200 text-stone-700 hover:border-rose-300 hover:bg-rose-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{variant.name}</span>
                              {variant.is_default && (
                                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-stone-600">
                                ${variantPrice.toFixed(2)}
                              </span>
                              {isVariantOutOfStock ? (
                                <span className="text-xs text-red-500 font-medium">
                                  Sin stock
                                </span>
                              ) : (
                                <span className="text-xs text-green-600 font-medium">
                                  {variantStock} disponible{variantStock !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                  
                  {/* Aviso si no hay variante seleccionada */}
                  {!selectedVariantId && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        Por favor, selecciona una presentación para continuar
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Actions */}
              <div className="space-y-4 mb-8 mt-auto">
                {/* Validar que si hay variantes, una esté seleccionada */}
                {product.variants && product.variants.length > 0 && !selectedVariantId ? (
                  <Button 
                    size="lg" 
                    fullWidth 
                    className="bg-gray-400 cursor-not-allowed h-14" 
                    disabled
                  >
                    Selecciona una presentación
                  </Button>
                ) : !isOutOfStock ? (
                  <div className="flex gap-4">
                    <div className="flex items-center border border-stone-200 rounded-xl h-14 w-32">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                        className="px-4 h-full text-stone-500 hover:text-rose-600 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="flex-1 text-center font-medium text-stone-900">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => {
                          const maxQty = availableStock > 0 ? availableStock : 999;
                          setQuantity(Math.min(maxQty, quantity + 1));
                        }} 
                        className="px-4 h-full text-stone-500 hover:text-rose-600 transition-colors"
                        disabled={quantity >= availableStock && availableStock > 0}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <Button 
                      size="lg" 
                      className="flex-1 h-14 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-stone-900 hover:bg-rose-600" 
                      onClick={handleAddToCart}
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" /> Añadir al Carrito
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    fullWidth 
                    className="bg-stone-800 hover:bg-stone-900 h-14" 
                    onClick={() => setShowWaitlist(true)}
                  >
                    <Bell className="mr-2 h-4 w-4" /> Avísame cuando esté disponible
                  </Button>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 border-stone-200 h-12 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700" onClick={() => setShowSubscription(true)}>
                    <Calendar className="mr-2 h-4 w-4" /> Suscríbete y Ahorra
                    15%
                  </Button>
                  <Tooltip content={isWishlisted ? 'Eliminar de favoritos' : 'Añadir a favoritos'}>
                    <button onClick={toggleWishlist} className={`p-3 rounded-xl border h-12 w-12 flex items-center justify-center transition-colors ${isWishlisted ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-stone-200 text-stone-400 hover:border-rose-400 hover:text-rose-600'}`}>
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 py-6 border-t border-stone-100">
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <div className="p-2 bg-rose-50 rounded-full text-rose-600">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span>Envío gratis {'>'} $50</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <div className="p-2 bg-rose-50 rounded-full text-rose-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span>Autenticidad Garantizada</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <div className="p-2 bg-rose-50 rounded-full text-rose-600">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <span>Devoluciones 30 días</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-stone-600">
                  <div className="p-2 bg-rose-50 rounded-full text-rose-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <span>Pago Seguro</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-24">
          <div className="flex justify-center border-b border-stone-200 mb-12">
            {['description', 'notes', 'reviews'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 text-sm font-medium border-b-2 transition-all relative ${activeTab === tab ? 'border-rose-600 text-rose-600' : 'border-transparent text-stone-500 hover:text-stone-800'}`}>
                {tab === 'description' && 'Descripción'}
                {tab === 'notes' && 'Notas Olfativas'}
                {tab === 'reviews' && 'Reseñas'}
              </button>)}
          </div>

          <div className="min-h-[300px] max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }} transition={{
              duration: 0.3
            }}>
                {activeTab === 'description' && <div className="prose prose-stone max-w-none">
                    <p className="text-lg leading-relaxed text-stone-600">
                      {product.description}
                    </p>
                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                      <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100">
                        <h4 className="font-serif text-xl font-bold mb-4 text-stone-900">
                          Modo de uso
                        </h4>
                        <p className="text-stone-600 leading-relaxed">
                          Aplica sobre los puntos de pulso: muñecas, cuello y
                          detrás de las orejas. Para una mayor duración, aplica
                          después de la ducha sobre la piel hidratada.
                        </p>
                      </div>
                      <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100">
                        <h4 className="font-serif text-xl font-bold mb-4 text-stone-900">
                          Ingredientes Clave
                        </h4>
                        <p className="text-stone-600 leading-relaxed">
                          Alcohol Denat, Parfum (Fragrance), Aqua (Water),
                          Ethylhexyl Methoxycinnamate, Butyl
                          Methoxydibenzoylmethane.
                        </p>
                      </div>
                    </div>
                  </div>}
                {activeTab === 'notes' && product.notes && <FragranceNotesPyramid notes={product.notes} />}
                {activeTab === 'reviews' && <ProductReviews productId={product.id} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-24 border-t border-stone-100 pt-16">
          <SmartRecommendations currentProductId={product.id} category={product.category} />
        </div>
      </div>

      {/* Modals */}
      <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
      <WaitlistModal 
        isOpen={showWaitlist} 
        onClose={() => setShowWaitlist(false)} 
        productName={product.name} 
        image={product.images && product.images.length > 0 
          ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || product.images[0].image_url || product.images[0]))
          : ''} 
      />
      <SubscriptionModal isOpen={showSubscription} onClose={() => setShowSubscription(false)} product={product} />
      <ComparisonFloatingBar />
    </div>;
}