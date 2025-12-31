import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/products/ProductCard';
import { getInfluencers, getInfluencerProducts, Influencer, InfluencerWithProducts } from '../api/influencers';
import { Product } from '../types';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { useToastStore } from '../stores/toastStore';
export function InfluencerCollectionsPage() {
  const [influencers, setInfluencers] = useState<InfluencerWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    try {
      setIsLoading(true);
      const response = await getInfluencers();
      
      if (response.success && response.data) {
        // Load products for each influencer
        const influencersWithProducts = await Promise.all(
          response.data.influencers.map(async (influencer) => {
            try {
              const productsResponse = await getInfluencerProducts(influencer.id);
              const products = productsResponse.success && productsResponse.data
                ? productsResponse.data.products.map(p => ({
                    ...p,
                    id: p.id.toString(),
                    images: p.images || [],
                    rating: 0,
                    reviews: 0,
                    isNew: false,
                    isBestSeller: false,
                    stock: 0
                  } as Product))
                : [];
              
              return {
                ...influencer,
                products
              } as InfluencerWithProducts;
            } catch (error) {
              console.error(`Error loading products for influencer ${influencer.id}:`, error);
              return {
                ...influencer,
                products: []
              } as InfluencerWithProducts;
            }
          })
        );
        
        setInfluencers(influencersWithProducts);
      } else {
        addToast({
          type: 'error',
          message: response.message || 'Error al cargar influencers'
        });
      }
    } catch (error: any) {
      console.error('Error loading influencers:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar colecciones de influencers'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PremiumLoader fullScreen text="Cargando colecciones..." />;
  }

  if (influencers.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Influencer Collections
          </h1>
          <p className="text-gray-600 mb-8">
            Las colecciones de influencers estarán disponibles pronto. 
            Esta funcionalidad requiere configuración en el backend.
          </p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=1600" alt="Influencer Collections" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white p-4 sm:p-8">
          <div className="max-w-3xl">
            <span className="text-rose-200 font-medium tracking-wider uppercase text-xs sm:text-sm mb-3 sm:mb-4 block">
              Curated by Icons
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6">
              The Muse Collection
            </h1>
            <p className="text-base sm:text-xl text-white/90">
              Discover exclusive edits curated by our global ambassadors and
              beauty icons.
            </p>
          </div>
        </div>
      </div>

      {/* Influencer Sections */}
      <div className="py-12 sm:py-20 space-y-16 sm:space-y-32 container-custom">
        {influencers.map((influencer, index) => (
          <div key={influencer.id} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 sm:gap-12 lg:gap-20`}>
            {/* Profile */}
            <div className="lg:w-1/3 flex-shrink-0">
              <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 group">
                <img src={influencer.image} alt={influencer.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 sm:p-8 text-white">
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black text-xs sm:text-sm">
                      <Instagram className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Follow
                    </Button>
                    {influencer.social.youtube && (
                      <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black text-xs sm:text-sm">
                        <Youtube className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Subscribe
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {influencer.name}
              </h2>
              <p className="text-rose-600 font-medium uppercase tracking-wider text-xs sm:text-sm mb-3 sm:mb-4">
                {influencer.role}
              </p>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
                {influencer.bio}
              </p>
              <Button variant="outline" className="group text-xs sm:text-sm">
                Watch Her Routine{' '}
                <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Collection Grid */}
            <div className="lg:w-2/3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-2">
                <h3 className="font-serif text-xl sm:text-2xl font-medium">
                  Her Essentials
                </h3>
                <a href="#" className="text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700">
                  Shop All
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {influencer.products.length > 0 ? (
                  influencer.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay productos disponibles para esta colección
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>;
}