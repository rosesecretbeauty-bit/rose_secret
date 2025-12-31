import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { getProductReviews, Review } from '../../api/reviews';
import { getProducts } from '../../api/products';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  verified: boolean;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        setLoading(true);
        // Fetch featured products to get reviews from
        const productsData = await getProducts({ limit: 5 });
        const featuredProducts = productsData.products || [];

        // Get top reviews from featured products
        const allTestimonials: Testimonial[] = [];
        
        for (const product of featuredProducts.slice(0, 3)) {
          try {
            const reviewsData = await getProductReviews(product.id, {
              limit: 3,
              rating: 5, // Only 5-star reviews for testimonials
            });
            
            if (reviewsData?.reviews && reviewsData.reviews.length > 0) {
              // Get the most helpful/highest rated review
              const topReview = reviewsData.reviews
                .sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0))[0];
              
              allTestimonials.push({
                id: topReview.id,
                name: topReview.user_name || 'Cliente',
                role: topReview.verified_purchase ? 'Verified Buyer' : 'Cliente',
                content: topReview.content,
                rating: topReview.rating,
                verified: topReview.verified_purchase,
              });
            }
          } catch (error) {
            console.error(`Error loading reviews for product ${product.id}:`, error);
          }
        }

        // If we don't have enough, try to get from any products with 5-star reviews
        if (allTestimonials.length < 3) {
          for (const product of featuredProducts) {
            if (allTestimonials.length >= 3) break;
            
            try {
              const reviewsData = await getProductReviews(product.id, {
                limit: 5,
              });
              
              if (reviewsData?.reviews && reviewsData.reviews.length > 0) {
                const topReview = reviewsData.reviews
                  .filter(r => r.rating >= 4)
                  .sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0))[0];
                
                if (topReview && !allTestimonials.find(t => t.id === topReview.id)) {
                  allTestimonials.push({
                    id: topReview.id,
                    name: topReview.user_name || 'Cliente',
                    role: topReview.verified_purchase ? 'Verified Buyer' : 'Cliente',
                    content: topReview.content,
                    rating: topReview.rating,
                    verified: topReview.verified_purchase,
                  });
                }
              }
            } catch (error) {
              console.error(`Error loading reviews for product ${product.id}:`, error);
            }
          }
        }

        setTestimonials(allTestimonials.slice(0, 3));
      } catch (error) {
        console.error('Error loading testimonials:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    }

    loadTestimonials();
  }, []);

  // If no testimonials, don't show the section
  if (!loading && testimonials.length === 0) {
    return null;
  }

  return <section className="py-24 bg-rose-50/30 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-champagne-100 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />

      <div className="container-custom relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center mb-16">
          <span className="text-rose-600 font-medium tracking-wider uppercase text-sm mb-3 block">
            Testimonios
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900">
            Lo que dicen nuestras clientas
          </h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-premium animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <motion.div key={testimonial.id} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.1
        }} className="bg-white p-8 rounded-2xl shadow-premium hover:shadow-premium-lg transition-shadow duration-300 relative group">
                <Quote className="absolute top-8 right-8 h-8 w-8 text-rose-100 group-hover:text-rose-200 transition-colors" />

                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                </div>

                <p className="text-gray-600 italic mb-8 leading-relaxed line-clamp-4">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <span className="text-rose-600 font-bold text-lg">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {testimonial.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" title="Verified Buyer" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-rose-500 font-medium uppercase tracking-wide">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>)}
          </div>
        )}
      </div>
    </section>;
}