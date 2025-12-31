import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { ProductGrid } from '../components/products/ProductGrid';
import { ProductFilters } from '../components/products/ProductFilters';
import { getCategoryProducts } from '../api/categories';
import { useCategoriesStore } from '../stores/categoriesStore';
import { Product } from '../types';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { trackEvent } from '../analytics/analyticsClient';

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  const {
    currentCategory: category,
    isLoading: isLoadingCategory,
    error: categoryError,
    loadCategoryBySlug,
    clearError
  } = useCategoriesStore();

  // Cargar categoría y productos
  useEffect(() => {
    async function loadCategoryData() {
      if (!slug) {
        return;
      }

      // Cargar categoría
      await loadCategoryBySlug(slug);

      // Track category view
      if (category) {
        trackEvent('VIEW_CATEGORY', {
          categoryId: category.id.toString(),
          categorySlug: category.slug,
          categoryName: category.name,
        });
      }

      // Cargar productos
      setIsLoadingProducts(true);
      try {
        const productsData = await getCategoryProducts(slug, 1, 100);

        if (productsData && productsData.products) {
          // Transformar productos de API a formato frontend
          const transformedProducts = productsData.products.map((p: any) => ({
            ...p,
            id: p.id.toString(),
            images: p.image_url ? [p.image_url] : [],
            rating: 0,
            reviews: 0,
            isNew: p.is_new || false,
            isBestSeller: p.is_bestseller || false,
            stock: p.stock || 0,
            category: p.category_slug || slug
          }));
          setProducts(transformedProducts);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.error('Error cargando productos:', err);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadCategoryData();
  }, [slug, loadCategoryBySlug]);

  // Limpiar error al desmontar
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const isLoading = isLoadingCategory || isLoadingProducts;
  const error = categoryError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <PremiumLoader />
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                {error || 'Categoría no encontrada'}
              </h1>
              <p className="text-gray-600 mb-6">
                La categoría que buscas no existe o ha sido eliminada.
              </p>
              <a
                href="/shop"
                className="inline-block px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Ver todos los productos
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Construir breadcrumbs desde la jerarquía
  const buildBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Inicio', path: '/' },
      { label: 'Tienda', path: '/shop' }
    ];

    // Si hay categoría padre, agregarla
    if (category.parent) {
      breadcrumbs.push({
        label: category.parent.name,
        path: `/category/${category.parent.slug}`
      });
    }

    // Agregar categoría actual
    breadcrumbs.push({
      label: category.name,
      path: `/category/${category.slug}`
    });

    return breadcrumbs;
  };

  const breadcrumbs = category ? buildBreadcrumbs() : [];

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container-custom">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <motion.li
                    key={crumb.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    {index === 0 ? (
                      <Link
                        to={crumb.path}
                        className="flex items-center gap-1.5 text-gray-500 hover:text-rose-600 transition-colors group"
                      >
                        <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">{crumb.label}</span>
                      </Link>
                    ) : isLast ? (
                      <span className="text-gray-900 font-medium">{crumb.label}</span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="text-gray-500 hover:text-rose-600 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                    {!isLast && <ChevronRight className="h-4 w-4 text-gray-300" />}
                  </motion.li>
                );
              })}
            </ol>
          </nav>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-600 mb-2">
              {category.description}
            </p>
          )}
          <p className="text-gray-600">
            {category.product_count !== undefined 
              ? `${category.product_count} producto${category.product_count !== 1 ? 's' : ''} disponible${category.product_count !== 1 ? 's' : ''}`
              : `${products.length} producto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`
            }
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ProductFilters
              selectedCategory={slug || ''}
              onCategoryChange={() => {}} // No cambiar categoría desde esta página
              priceRange={[0, 1000]}
              onPriceRangeChange={() => {}} // TODO: Implementar filtro de precio
              selectedBrands={[]}
              onBrandChange={() => {}} // TODO: Implementar filtro de marca
              minRating={null}
              onRatingChange={() => {}} // TODO: Implementar filtro de rating
              showNewArrivals={false}
              onNewArrivalsChange={() => {}} // TODO: Implementar filtro de nuevos
              showBestSellers={false}
              onBestSellersChange={() => {}} // TODO: Implementar filtro de bestsellers
              onClearAll={() => {}} // TODO: Implementar limpiar filtros
            />
          </div>
          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                    No hay productos disponibles
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Esta categoría aún no tiene productos disponibles. Vuelve pronto para ver novedades.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium"
                  >
                    Explorar todos los productos
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}