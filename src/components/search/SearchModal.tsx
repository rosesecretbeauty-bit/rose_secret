import React, { useEffect, useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useSearchStore } from '../../stores/searchStore';
import { getProducts } from '../../api/products';
import { transformProducts } from '../../utils/productTransform';
import { Product } from '../../types';

export function SearchModal() {
  const {
    isOpen,
    closeSearch
  } = useSearchStore();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    if (query.trim()) {
      setIsLoadingSuggestions(true);
      
      // Debounce de 300ms para evitar demasiadas llamadas API
      const timer = setTimeout(async () => {
        try {
          const data = await getProducts({ 
            search: query, 
            limit: 4 
          });
          
          // Transformar productos del backend al formato del frontend
          const transformed = transformProducts(data.products);
          setSuggestions(transformed);
        } catch (error) {
          console.error('Error searching products:', error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      closeSearch();
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  const handleRecentClick = (term: string) => {
    setQuery(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    closeSearch();
  };
  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={closeSearch} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl rounded-b-3xl overflow-hidden">
            <div className="container-custom py-6">
              <form onSubmit={handleSearch} className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for products, brands, and more..." className="w-full pl-14 pr-12 py-4 text-lg bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500/20 text-gray-900 placeholder-gray-400" autoFocus />
                <button type="button" onClick={closeSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-4">
                {/* Recent & Trending */}
                {!query && <>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-rose-500" /> Recent
                          Searches
                        </h3>
                        {recentSearches.length > 0 && <button onClick={clearRecent} className="text-xs text-gray-500 hover:text-rose-600">
                            Clear All
                          </button>}
                      </div>
                      {recentSearches.length > 0 ? <div className="flex flex-wrap gap-2">
                          {recentSearches.map(term => <button key={term} onClick={() => handleRecentClick(term)} className="px-4 py-2 bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-700 rounded-lg text-sm transition-colors">
                              {term}
                            </button>)}
                        </div> : <p className="text-sm text-gray-400 italic">
                          No recent searches
                        </p>}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <TrendingUp className="h-4 w-4 text-rose-500" />{' '}
                        Trending Now
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['Summer Fragrances', 'Gift Sets', 'Organic Skincare', 'Luxury Candles'].map(term => <button key={term} onClick={() => handleRecentClick(term)} className="px-4 py-2 bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-700 rounded-lg text-sm transition-colors flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-gray-400" />
                            {term}
                          </button>)}
                      </div>
                    </div>
                  </>}

                {/* Suggestions */}
                {query && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      Products
                    </h3>
                    {isLoadingSuggestions ? (
                      <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-full flex items-center gap-4 p-3 rounded-xl">
                            <div className="h-12 w-12 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 w-3/4 rounded animate-pulse" />
                              <div className="h-3 bg-gray-200 w-1/2 rounded animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : suggestions.length > 0 ? (
                      <>
                        <div className="space-y-2">
                          {suggestions.map(product => (
                            <button 
                              key={product.id} 
                              onClick={() => {
                                navigate(`/product/${product.id}`);
                                closeSearch();
                              }} 
                              className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left"
                            >
                              <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                <img 
                                  src={product.images[0] || '/placeholder.png'} 
                                  alt={product.name} 
                                  className="h-full w-full object-cover" 
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 group-hover:text-rose-600 transition-colors">
                                  {product.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {product.category}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-rose-600" />
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={handleSearch} 
                          className="w-full mt-4 py-3 text-center text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          View all results for "{query}"
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">
                          No se encontraron productos para "{query}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>}
    </AnimatePresence>;
}