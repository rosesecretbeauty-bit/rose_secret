import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { getCategories, Category } from '../../api/categories';
import { PriceRangeSlider } from '../ui/PriceRangeSlider';
import { Badge } from '../ui/Badge';
interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedBrands: string[];
  onBrandChange: (brand: string) => void;
  minRating: number | null;
  onRatingChange: (rating: number | null) => void;
  showNewArrivals: boolean;
  onNewArrivalsChange: (show: boolean) => void;
  showBestSellers: boolean;
  onBestSellersChange: (show: boolean) => void;
  onClearAll: () => void;
}
const brands = ['Rose Secret', 'Luxe Beauty', 'Pure Essence', 'Golden Hour', 'Velvet Touch'];
export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  selectedBrands = [],
  onBrandChange,
  minRating,
  onRatingChange,
  showNewArrivals,
  onNewArrivalsChange,
  showBestSellers,
  onBestSellersChange,
  onClearAll
}: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Cargar categorías desde API
  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        // En caso de error, mantener array vacío para evitar errores
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Ensure selectedBrands is always an array
  const safeBrands = selectedBrands || [];
  const hasActiveFilters = selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000 || safeBrands.length > 0 || minRating !== null || showNewArrivals || showBestSellers;
  return <div className="space-y-8">
      {/* Active Filters Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium">Filtros</h3>
        {hasActiveFilters && <button onClick={onClearAll} className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1">
            <X className="h-3 w-3" />
            Limpiar todo
          </button>}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
          Categorías
        </h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="category"
              value="all"
              checked={selectedCategory === 'all'}
              onChange={e => onCategoryChange(e.target.value)}
              className="h-4 w-4 text-rose-600 border-gray-300 focus:ring-rose-500"
            />
            <span className={`ml-3 text-sm transition-colors ${
              selectedCategory === 'all' ? 'text-rose-700 font-medium' : 'text-gray-600 group-hover:text-gray-900'
            }`}>
              Todos
            </span>
          </label>
          {isLoadingCategories ? (
            <div className="text-xs text-gray-400">Cargando categorías...</div>
          ) : (
            categories.map(category => (
              <label key={category.id} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={selectedCategory === category.slug}
                  onChange={e => onCategoryChange(e.target.value)}
                  className="h-4 w-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                />
                <span className={`ml-3 text-sm transition-colors ${
                  selectedCategory === category.slug ? 'text-rose-700 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                }`}>
                  {category.name}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
          Precio
        </h4>
        <PriceRangeSlider min={0} max={1000} step={10} value={priceRange} onChange={onPriceRangeChange} />
      </div>

      {/* Brands */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
          Marcas
        </h4>
        <div className="space-y-2">
          {brands.map(brand => <label key={brand} className="flex items-center cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${safeBrands.includes(brand) ? 'bg-rose-600 border-rose-600' : 'border-gray-300 bg-white group-hover:border-rose-400'}`}>
                {safeBrands.includes(brand) && <Check className="h-3 w-3 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={safeBrands.includes(brand)} onChange={() => onBrandChange(brand)} />
              <span className={`ml-3 text-sm ${safeBrands.includes(brand) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {brand}
              </span>
            </label>)}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
          Valoración
        </h4>
        <div className="space-y-2">
          {[4, 3, 2].map(rating => <button key={rating} onClick={() => onRatingChange(minRating === rating ? null : rating)} className={`flex items-center w-full text-sm ${minRating === rating ? 'text-rose-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => <svg key={i} className={`h-4 w-4 ${i < rating ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>)}
              </div>
              <span>{rating}+ Estrellas</span>
            </button>)}
        </div>
      </div>

      {/* Special Collections */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
          Colecciones
        </h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-gray-700 group-hover:text-rose-600">
              Nuevos Lanzamientos
            </span>
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${showNewArrivals ? 'bg-rose-600' : 'bg-gray-200'}`}>
              <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${showNewArrivals ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <input type="checkbox" className="hidden" checked={showNewArrivals} onChange={e => onNewArrivalsChange(e.target.checked)} />
          </label>

          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-gray-700 group-hover:text-rose-600">
              Más Vendidos
            </span>
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${showBestSellers ? 'bg-rose-600' : 'bg-gray-200'}`}>
              <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${showBestSellers ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <input type="checkbox" className="hidden" checked={showBestSellers} onChange={e => onBestSellersChange(e.target.checked)} />
          </label>
        </div>
      </div>
    </div>;
}