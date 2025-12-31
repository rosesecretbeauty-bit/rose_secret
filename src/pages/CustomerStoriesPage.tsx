import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
export function CustomerStoriesPage() {
  const stories = [{
    name: 'Elena R.',
    role: 'Loyal Customer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    quote: 'Rose Secret changed my daily routine. The fragrances are not just scents, they are experiences.',
    product: 'Midnight Rose'
  }, {
    name: 'Sofia M.',
    role: 'Beauty Editor',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    quote: "I've tried luxury brands from all over the world, but the attention to detail here is unmatched.",
    product: 'Gold Elixir'
  }, {
    name: 'Isabella K.',
    role: 'Perfume Collector',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    quote: 'The layering guide helped me find my signature scent. I get compliments everywhere I go.',
    product: 'Custom Bundle'
  }];
  return <div className="bg-white min-h-screen pb-20">
      <div className="bg-rose-50 py-20 text-center">
        <div className="container-custom">
          <h1 className="font-serif text-5xl font-bold text-gray-900 mb-6">
            Community Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from real people who have found their perfect match
            with Rose Secret.
          </p>
        </div>
      </div>

      <div className="container-custom py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, i) => <motion.div key={i} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: i * 0.1
        }}>
              <GlassCard className="h-full p-8 flex flex-col items-center text-center" hover>
                <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg">
                  <img src={story.image} alt={story.name} className="w-full h-full object-cover" />
                </div>
                <Quote className="h-8 w-8 text-rose-300 mb-4" />
                <p className="text-gray-600 italic mb-6 flex-1">
                  "{story.quote}"
                </p>
                <div>
                  <h4 className="font-bold text-gray-900">{story.name}</h4>
                  <p className="text-sm text-rose-600">{story.role}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Favorite: {story.product}
                  </p>
                </div>
              </GlassCard>
            </motion.div>)}
        </div>
      </div>
    </div>;
}