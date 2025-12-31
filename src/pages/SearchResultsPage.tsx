import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, XCircle } from 'lucide-react';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { ProductGrid } from '../components/products/ProductGrid';
import { Button } from '../components/ui/Button';
import { PremiumLoader } from '../components/ui/PremiumLoader';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function performSearch() {
      if (!query || query.trim() === '') {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Llamar a la API con el parámetro de búsqueda
        const response = await getProducts({
          search: query.trim(),
          page: 1,
          limit: 100 // Obtener hasta 100 resultados
        });

        if (response && response.products) {
          // Transformar productos de API a formato frontend
          const transformedProducts: Product[] = response.products.map((p: any) => ({
            ...p,
            id: p.id?.toString() || String(p.id),
            images: p.image_url ? [p.image_url] : (p.images || []),
            rating: p.rating || 0,
            reviews: p.reviews || 0,
            isNew: p.is_new || false,
            isBestSeller: p.is_bestseller || false,
            stock: p.stock || 0,
            category: p.category_slug || p.category || 'uncategorized',
            brand: p.brand || undefined,
            description: p.description || p.short_description || ''
          }));
          
          setResults(transformedProducts);
        } else {
          setResults([]);
        }
      } catch (err: any) {
        console.error('Error en búsqueda:', err);
        setError(err.message || 'Error al buscar productos');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce: esperar 300ms después de que el usuario deje de escribir
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);
  if (isLoading) {
    return <PremiumLoader fullScreen text="Buscando en el catálogo..." />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container-custom">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Resultados de Búsqueda
          </h1>
          {query && (
            <p className="text-gray-600">
              {results.length > 0 ? (
                <>
                  {results.length} resultado{results.length !== 1 ? 's' : ''} para{' '}
                  <span className="font-bold text-gray-900">"{query}"</span>
                </>
              ) : (
                <>
                  No se encontraron resultados para{' '}
                  <span className="font-bold text-gray-900">"{query}"</span>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="container-custom py-12">
        {error ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
            <XCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              Error en la búsqueda
            </h3>
            <p className="text-gray-500 mb-6">
              {error}
            </p>
            <Button onClick={() => window.location.href = '/shop'}>
              Ver todos los productos
            </Button>
          </div>
        ) : results.length > 0 ? (
          <ProductGrid products={results} />
        ) : query ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-500 mb-6">
              No encontramos productos que coincidan con "{query}". Intenta con otras palabras clave o verifica la ortografía.
            </p>
            <Button onClick={() => window.location.href = '/shop'}>
              Ver todos los productos
            </Button>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
              Ingresa un término de búsqueda
            </h3>
            <p className="text-gray-500 mb-6">
              Busca productos por nombre, descripción, categoría o marca.
            </p>
            <Button onClick={() => window.location.href = '/shop'}>
              Ver todos los productos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}