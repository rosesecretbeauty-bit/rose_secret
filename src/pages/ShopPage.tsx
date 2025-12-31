import React, { useEffect, useMemo, useState, Component } from 'react';
import { setPageTitle, setMetaDescription } from '../utils/seo';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Filter, X, ChevronDown, Search, Grid, List, LayoutGrid, Star, Heart, ShoppingBag, Eye, SlidersHorizontal, Check, TrendingUp, Zap } from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PriceRangeSlider } from '../components/ui/PriceRangeSlider';
import { Category } from '../api/categories';
import { useCategoriesStore } from '../stores/categoriesStore';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useToastStore } from '../stores/toastStore';
import { trackEvent } from '../analytics/analyticsClient';
import { QuickView } from '../components/products/QuickView';
import { useScrollDirection } from '../hooks/useScrollDirection';
type ViewMode = 'grid-2' | 'grid-3' | 'grid-4' | 'list';
type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'discount';
// --- Helper Components ---
const FilterSection = ({
  title,
  children,
  isOpen = true
}: {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  return <div className="border-b border-stone-200 py-6 last:border-0">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center justify-between w-full text-left group">
        <span className="font-serif text-lg font-medium text-stone-900 group-hover:text-rose-600 transition-colors">
          {title}
        </span>
        <motion.div animate={{
        rotate: isExpanded ? 180 : 0
      }} transition={{
        duration: 0.2
      }}>
          <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-rose-600" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }} className="overflow-hidden">
            <div className="pt-4 pb-2 space-y-3">{children}</div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};
const ProductCardList = ({
  product
}: {
  product: Product;
}) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const {
    addItem: addToWishlist,
    isInWishlist
  } = useWishlistStore();
  const addToast = useToastStore(state => state.addToast);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    addToast({
      type: 'success',
      message: 'Añadido al carrito'
    });
  };
  return <>
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="group bg-white rounded-xl border border-stone-100 hover:border-rose-200 hover:shadow-premium transition-all duration-500 flex flex-col sm:flex-row overflow-hidden">
        <div className="w-full sm:w-64 h-64 sm:h-auto relative overflow-hidden bg-stone-50">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          {product.discount && <div className="absolute top-4 left-4">
              <Badge className="bg-rose-600 text-white shadow-lg">
                -{product.discount}%
              </Badge>
            </div>}
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-rose-600 uppercase tracking-widest font-medium mb-1">
                {product.brand || 'Rose Secret'}
              </p>
              <Link to={`/product/${product.id}`}>
                <h3 className="font-serif text-xl text-stone-900 group-hover:text-rose-600 transition-colors duration-300">
                  {product.name}
                </h3>
              </Link>
            </div>
            {product.rating > 0 && <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-stone-600">
                  {product.rating}
                </span>
              </div>}
          </div>

          <p className="text-stone-500 mb-6 line-clamp-2 text-sm leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
            <div className="flex flex-col">
              {product.originalPrice && <span className="text-xs text-stone-400 line-through mb-0.5">
                  ${parseFloat(product.originalPrice?.toString() || '0').toFixed(2)}
                </span>}
              <span className="font-serif text-xl font-bold text-stone-900">
                ${parseFloat(product.price?.toString() || '0').toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowQuickView(true)} className="rounded-full hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600">
                Vista Rápida
              </Button>
              <Button onClick={handleAddToCart} size="sm" className="rounded-full bg-stone-900 hover:bg-rose-600 border-none">
                Añadir
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
      <QuickView product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </>;
};
// --- Main Component ---
export function ShopPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  // Scroll direction for coordinated animation with navigation
  const scrollDirection = useScrollDirection();
  const {
    scrollY
  } = useScroll();
  const shouldHideHeader = scrollDirection === 'down' && scrollY.get() > 150;
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid-3');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  // Categories from store
  const {
    categories,
    isLoading: isLoadingCategories,
    loadCategories
  } = useCategoriesStore();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  // Derived Data
  const brands = useMemo(() => Array.from(new Set(products.map(p => p.brand || 'Rose Secret'))), [products]);
  
  // Load categories from API
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      // Si las categorías aún no están cargadas y se necesita una categoría específica, esperar
      if (selectedCategory !== 'all' && categories.length === 0 && isLoadingCategories) {
        return; // Esperar a que se carguen las categorías
      }

      setIsLoading(true);
      try {
        // Si selectedCategory es un slug, buscar el category_id correspondiente
        let categoryId: string | undefined = undefined;
        if (selectedCategory !== 'all') {
          const category = categories.find(c => c.slug === selectedCategory);
          if (category) {
            categoryId = category.id.toString();
          } else if (!isLoadingCategories) {
            // Si las categorías ya se cargaron y no se encuentra, puede ser un error
            // Silencioso: categoría no encontrada, continuar sin filtro de categoría
            // No cargar productos filtrados, pero no mostrar error
            setProducts([]);
            setIsLoading(false);
            return;
          } else {
            // Aún cargando categorías, esperar
            setIsLoading(false);
            return;
          }
        }
        const category = categoryId;
        const data = await getProducts({ 
          category,
          search: searchQuery || undefined,
          limit: 100 
        });
        // Transform API products to match frontend Product type
        const transformedProducts = data.products.map((p: any) => ({
          ...p,
          id: p.id.toString(),
          images: p.image_url ? [p.image_url] : [],
          rating: p.rating || 0,
          reviews: p.reviews_count || 0,
          isNew: p.is_new || false,
          isBestSeller: p.is_bestseller || false,
          stock: p.stock || 0
        }));
        setProducts(transformedProducts);

        // Track search if there's a search query
        if (searchQuery && searchQuery.trim()) {
          trackEvent('SEARCH_PRODUCTS', {
            query: searchQuery.trim(),
            resultsCount: transformedProducts.length,
          });
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory, searchQuery, categories, isLoadingCategories]);
  // Filter Logic (local filtering for price, brands, sort)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand || 'Rose Secret')) return false;
      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'discount':
          return (b.discount || 0) - (a.discount || 0);
        default:
          return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      }
    });
  }, [products, priceRange, selectedBrands, sortBy]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (selectedCategory === 'all') params.delete('category');else params.set('category', selectedCategory);
    navigate({
      search: params.toString()
    }, {
      replace: true
    });
  }, [selectedCategory, selectedBrands, priceRange, sortBy, navigate, location.search]);
  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange([0, 300]);
    setSelectedBrands([]);
    setSortBy('featured');
  };
  const getGridClass = () => {
    switch (viewMode) {
      case 'grid-2':
        return 'grid-cols-2';
      case 'grid-4':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };
  return <div className="bg-stone-50 min-h-screen pb-20">
      {/* Sticky Header & Controls - Coordinated with Navigation */}
      <motion.div initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} className={`
          bg-white/90 backdrop-blur-xl border-b border-stone-200 
          sticky z-40 shadow-sm
          transition-all duration-300 ease-in-out
          ${shouldHideHeader ? 'top-0' : 'top-20'}
        `}>
        <div className="container-custom py-4">
          <div className="flex flex-col gap-4">
            {/* Top Row: Title & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-baseline gap-4">
                <h1 className="font-serif text-3xl font-medium text-stone-900">
                  Colección
                </h1>
                <span className="text-sm font-light text-stone-500 border-l border-stone-300 pl-4">
                  {filteredProducts.length} resultados
                </span>
              </div>

              <div className="flex items-center gap-3 flex-1 md:flex-none">
                <div className="relative flex-1 md:w-80 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-rose-600 transition-colors" />
                  <input type="text" placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-all placeholder:text-stone-400 font-light" />
                </div>
                <Button variant="outline" className="lg:hidden" onClick={() => setIsMobileFiltersOpen(true)} leftIcon={<SlidersHorizontal className="h-4 w-4" />}>
                  Filtros
                </Button>
              </div>
            </div>

            {/* Bottom Row: Sort & View */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
              {/* Sort Options */}
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap">
                  Ordenar por:
                </span>
                <div className="flex gap-4">
                  {[{
                  id: 'featured',
                  label: 'Destacados'
                }, {
                  id: 'newest',
                  label: 'Novedades'
                }, {
                  id: 'price-asc',
                  label: 'Precio: Bajo a Alto'
                }, {
                  id: 'price-desc',
                  label: 'Precio: Alto a Bajo'
                }].map(opt => <button key={opt.id} onClick={() => setSortBy(opt.id as SortOption)} className={`text-sm transition-colors relative py-1 whitespace-nowrap ${sortBy === opt.id ? 'text-rose-600 font-medium' : 'text-stone-500 hover:text-stone-900'}`}>
                      {opt.label}
                      {sortBy === opt.id && <motion.div layoutId="activeSort" className="absolute bottom-0 left-0 right-0 h-px bg-rose-600" />}
                    </button>)}
                </div>
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-2">
                {[{
                mode: 'grid-2',
                icon: Grid
              }, {
                mode: 'grid-3',
                icon: LayoutGrid
              }, {
                mode: 'list',
                icon: List
              }].map(({
                mode,
                icon: Icon
              }) => <button key={mode} onClick={() => setViewMode(mode as ViewMode)} className={`p-2 rounded-md transition-all ${viewMode === mode ? 'text-rose-600 bg-rose-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}>
                    <Icon className="w-4 h-4" />
                  </button>)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container-custom py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters - Adjusted sticky position */}
          <aside className={`
              hidden lg:block w-64 flex-shrink-0 
              sticky h-[calc(100vh-14rem)] overflow-y-auto 
              custom-scrollbar pr-6 z-10
              transition-all duration-300 ease-in-out
              ${shouldHideHeader ? 'top-36' : 'top-56'}
            `}>
            <div className="mb-8 flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Filtros
              </h3>
              <button onClick={clearFilters} className="text-xs text-stone-500 hover:text-rose-600 underline decoration-stone-300 hover:decoration-rose-600 underline-offset-4 transition-all">
                Limpiar
              </button>
            </div>

            <FilterSection title="Categorías">
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center justify-between w-full py-1 text-sm transition-all group ${
                    selectedCategory === 'all' ? 'text-rose-600 font-medium' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    Todos
                  </span>
                  {selectedCategory === 'all' && (
                    <motion.div layoutId="activeCategory">
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  )}
                </button>
                {isLoadingCategories ? (
                  <div className="text-sm text-stone-400">Cargando categorías...</div>
                ) : (
                  categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`flex items-center justify-between w-full py-1 text-sm transition-all group ${
                        selectedCategory === category.slug ? 'text-rose-600 font-medium' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {category.name}
                      </span>
                      {selectedCategory === category.slug && (
                        <motion.div layoutId="activeCategory">
                          <Check className="w-3.5 h-3.5" />
                        </motion.div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </FilterSection>

            <FilterSection title="Precio">
              <div className="px-1 pb-6 pt-4">
                <PriceRangeSlider min={0} max={300} step={10} value={priceRange} onChange={setPriceRange} />
                <div className="flex justify-between mt-4 text-xs font-medium text-stone-900 font-mono">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Marcas">
              <div className="space-y-2">
                {brands.map(brand => <label key={brand} className="flex items-center gap-3 cursor-pointer group py-1">
                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all duration-300 ${selectedBrands.includes(brand) ? 'bg-rose-600 border-rose-600' : 'border-stone-300 group-hover:border-rose-400'}`}>
                      {selectedBrands.includes(brand) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedBrands.includes(brand)} onChange={() => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])} />
                    <span className={`text-sm transition-colors ${selectedBrands.includes(brand) ? 'text-stone-900 font-medium' : 'text-stone-600 group-hover:text-stone-900'}`}>
                      {brand}
                    </span>
                  </label>)}
              </div>
            </FilterSection>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Marketing Banner */}
            <div className="mb-8 bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl p-4 flex items-center gap-3 text-rose-800 border border-rose-100 shadow-sm">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <TrendingUp className="w-5 h-5 text-rose-600" />
              </div>
              <p className="text-sm font-medium">
                <span className="font-bold">Tendencia:</span> Los perfumes
                florales están siendo muy populares esta semana.
              </p>
            </div>

            {isLoading ? <div className={`grid gap-x-6 gap-y-10 ${viewMode === 'list' ? 'grid-cols-1' : getGridClass()}`}>
                {[...Array(6)].map((_, i) => <div key={i} className="space-y-4">
                    <div className="bg-stone-100 aspect-[3/4] w-full rounded-xl animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-stone-100 w-3/4 rounded animate-pulse" />
                      <div className="h-4 bg-stone-100 w-1/2 rounded animate-pulse" />
                    </div>
                  </div>)}
              </div> : filteredProducts.length > 0 ? <div className={`grid gap-x-6 gap-y-10 ${viewMode === 'list' ? 'grid-cols-1' : getGridClass()}`}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, index) => <motion.div key={product.id} layout initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                scale: 0.95
              }} transition={{
                duration: 0.4,
                delay: index * 0.05
              }}>
                      {viewMode === 'list' ? <ProductCardList product={product} /> : <ProductCard product={product} />}
                    </motion.div>)}
                </AnimatePresence>
              </div> : <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-stone-300" />
                </div>
                <h3 className="font-serif text-3xl text-stone-900 mb-3">
                  Sin resultados
                </h3>
                <p className="text-stone-500 mb-8 max-w-md font-light">
                  No encontramos productos que coincidan con tu búsqueda.
                  Intenta ajustar los filtros.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Limpiar Filtros
                </Button>
              </div>}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {isMobileFiltersOpen && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} onClick={() => setIsMobileFiltersOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden" />
            <motion.div initial={{
          y: '100%'
        }} animate={{
          y: 0
        }} exit={{
          y: '100%'
        }} transition={{
          type: 'spring',
          damping: 25,
          stiffness: 200
        }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Filtros
                </h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
                <div>
                  <h3 className="font-medium text-stone-900 mb-4">
                    Categorías
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="mobile-category"
                        checked={selectedCategory === 'all'}
                        onChange={() => setSelectedCategory('all')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-stone-600">Todos</span>
                    </label>
                    {isLoadingCategories ? (
                      <div className="text-sm text-stone-400">Cargando categorías...</div>
                    ) : (
                      categories.map(category => (
                        <label key={category.id} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="mobile-category"
                            checked={selectedCategory === category.slug}
                            onChange={() => setSelectedCategory(category.slug)}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span className="text-stone-600">{category.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-stone-900 mb-4">Precio</h3>
                  <PriceRangeSlider min={0} max={300} step={10} value={priceRange} onChange={setPriceRange} />
                  <div className="flex justify-between mt-2 text-sm text-stone-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 border-t border-stone-100 bg-stone-50 safe-area-bottom flex-shrink-0">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={clearFilters} fullWidth>
                    Limpiar
                  </Button>
                  <Button onClick={() => setIsMobileFiltersOpen(false)} fullWidth>
                    Ver {filteredProducts.length} resultados
                  </Button>
                </div>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </div>;
}