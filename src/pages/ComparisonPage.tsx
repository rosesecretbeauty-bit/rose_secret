import React from 'react';
import { motion } from 'framer-motion';
import { X, ShoppingBag, Check, Minus } from 'lucide-react';
import { useComparisonStore } from '../stores/comparisonStore';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
export function ComparisonPage() {
  const {
    items,
    removeItem,
    clearAll
  } = useComparisonStore();
  const addItem = useCartStore(state => state.addItem);
  if (items.length === 0) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-4">
            Compare Products
          </h1>
          <p className="text-gray-600 mb-8">
            You haven't added any products to compare yet.
          </p>
          <Link to="/shop">
            <Button>Explorar Productos</Button>
          </Link>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
            Compare Products
          </h1>
          <Button variant="outline" onClick={clearAll} className="text-red-600 hover:bg-red-50 border-red-200 text-sm sm:text-base">
            Clear All
          </Button>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {items.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <img src={product.images[0]} alt={product.name} className="h-20 w-20 object-contain" />
                <button onClick={() => removeItem(product.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Link to={`/product/${product.id}`} className="font-serif font-bold text-gray-900 hover:text-rose-600 block mb-4">
                {product.name}
              </Link>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Price:</span>
                  <span className="ml-2 font-medium text-rose-600">${parseFloat(product.price?.toString() || '0').toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rating:</span>
                  <span className="ml-2">{product.rating} ★</span>
                </div>
                <div>
                  <span className="text-gray-500">Brand:</span>
                  <span className="ml-2">{product.brand || 'Rose Secret'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Stock:</span>
                  {product.stock > 0 ? (
                    <span className="ml-2 text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> In Stock
                    </span>
                  ) : (
                    <span className="ml-2 text-red-600 flex items-center gap-1">
                      <Minus className="h-3 w-3" /> Out of Stock
                    </span>
                  )}
                </div>
              </div>
              <Button size="sm" fullWidth className="mt-4" onClick={() => addItem(product)} disabled={product.stock === 0}>
                <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
              </Button>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto pb-6">
          <div className="min-w-[800px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))]">
              {/* Headers Column */}
              <div className="bg-gray-50 border-r border-gray-100 p-6 space-y-8">
                <div className="h-40"></div> {/* Spacer for images */}
                <div className="font-bold text-gray-900 h-12 flex items-center">
                  Price
                </div>
                <div className="font-bold text-gray-900 h-12 flex items-center">
                  Rating
                </div>
                <div className="font-bold text-gray-900 h-12 flex items-center">
                  Brand
                </div>
                <div className="font-bold text-gray-900 h-12 flex items-center">
                  Category
                </div>
                <div className="font-bold text-gray-900 h-24 flex items-center">
                  Description
                </div>
                <div className="font-bold text-gray-900 h-12 flex items-center">
                  Stock Status
                </div>
                <div className="font-bold text-gray-900 h-12 flex items-center">
                  Action
                </div>
              </div>

              {/* Product Columns */}
              {items.map(product => <div key={product.id} className="p-6 border-r border-gray-100 last:border-0 min-w-[250px] relative">
                  <button onClick={() => removeItem(product.id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors">
                    <X className="h-5 w-5" />
                  </button>

                  <div className="h-40 mb-8 flex flex-col items-center justify-center text-center">
                    <img src={product.images[0]} alt={product.name} className="h-24 object-contain mb-4" />
                    <Link to={`/product/${product.id}`} className="font-serif font-bold text-gray-900 hover:text-rose-600">
                      {product.name}
                    </Link>
                  </div>

                  <div className="space-y-8">
                    <div className="h-12 flex items-center justify-center font-medium text-lg text-rose-600">
                      ${parseFloat(product.price?.toString() || '0').toFixed(2)}
                    </div>
                    <div className="h-12 flex items-center justify-center">
                      <span className="flex items-center gap-1">
                        {product.rating}{' '}
                        <span className="text-yellow-400">★</span>
                        <span className="text-gray-400 text-sm">
                          ({product.reviews})
                        </span>
                      </span>
                    </div>
                    <div className="h-12 flex items-center justify-center text-gray-600">
                      {product.brand || 'Rose Secret'}
                    </div>
                    <div className="h-12 flex items-center justify-center text-gray-600 capitalize">
                      {product.category}
                    </div>
                    <div className="h-24 flex items-center justify-center text-sm text-gray-500 text-center line-clamp-3 px-2">
                      {product.description}
                    </div>
                    <div className="h-12 flex items-center justify-center">
                      {product.stock > 0 ? <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                          <Check className="h-4 w-4" /> En Stock
                        </span> : <span className="text-red-600 flex items-center gap-1 text-sm font-medium">
                          <Minus className="h-4 w-4" /> Sin Stock
                        </span>}
                    </div>
                    <div className="h-12 flex items-center justify-center">
                      <Button size="sm" fullWidth onClick={() => addItem(product)} disabled={product.stock === 0}>
                        <ShoppingBag className="h-4 w-4 mr-2" /> Añadir al Carrito
                      </Button>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
}