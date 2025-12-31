import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Trash2, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { useToastStore } from '../stores/toastStore';
export function SavedSearchesPage() {
  const addToast = useToastStore(state => state.addToast);
  // Mock data
  const savedSearches = [{
    id: 1,
    query: 'Rose Perfume',
    filters: 'Price: $50-$150, Brand: Chanel',
    date: '2 days ago',
    newResults: 3
  }, {
    id: 2,
    query: 'Anti-aging Serum',
    filters: 'Rating: 4+, In Stock',
    date: '1 week ago',
    newResults: 0
  }, {
    id: 3,
    query: 'Summer Collection',
    filters: 'Category: Fragrance',
    date: '2 weeks ago',
    newResults: 12
  }];
  const handleDelete = (id: number) => {
    addToast({
      type: 'success',
      message: 'Search removed from saved list'
    });
  };
  return <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
              Saved Searches
            </h1>
            <p className="text-gray-600">
              Manage your tracked searches and alerts.
            </p>
          </div>
          <Link to="/search">
            <Button>
              <Search className="mr-2 h-4 w-4" /> New Search
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {savedSearches.map((search, index) => <motion.div key={search.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }}>
              <GlassCard className="p-6" hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                      <Search className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        {search.query}
                        {search.newResults > 0 && <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                            {search.newResults} new
                          </span>}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {search.filters}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Saved {search.date}
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <Bell className="h-3 w-3" /> Alerts On
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link to={`/search?q=${encodeURIComponent(search.query)}`}>
                      <Button variant="outline" size="sm">
                        View Results <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                    <button onClick={() => handleDelete(search.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Search">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>)}

          {savedSearches.length === 0 && <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No saved searches yet
              </h3>
              <p className="text-gray-500 mb-6">
                Save searches to get notified about new products and price
                drops.
              </p>
              <Link to="/search">
                <Button>Start Searching</Button>
              </Link>
            </div>}
        </div>
      </div>
    </div>;
}