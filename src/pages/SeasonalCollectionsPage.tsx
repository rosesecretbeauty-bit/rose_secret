import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function SeasonalCollectionsPage() {
  const collections = [{
    title: 'Summer Solstice',
    season: 'Summer 2024',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200',
    desc: 'Light, airy, and full of sunshine. Notes of citrus and sea salt.'
  }, {
    title: 'Autumn Whisper',
    season: 'Fall 2024',
    image: 'https://images.unsplash.com/photo-1506812779316-934cef03419c?w=1200',
    desc: 'Warm spices and woody undertones for the cooling days.'
  }, {
    title: 'Winter Frost',
    season: 'Winter 2024',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
    desc: 'Crisp, clean scents mixed with cozy vanilla and amber.'
  }];
  return <div className="bg-white min-h-screen pb-20">
      <div className="container-custom py-16">
        <h1 className="font-serif text-5xl font-bold text-center mb-4">
          Seasonal Collections
        </h1>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Explore our limited edition releases curated for the changing seasons.
        </p>

        <div className="space-y-16">
          {collections.map((collection, i) => <motion.div key={i} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} className="relative h-[500px] rounded-3xl overflow-hidden group">
              <img src={collection.image} alt={collection.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

              <div className="absolute bottom-0 left-0 p-12 text-white">
                <span className="text-rose-300 font-bold tracking-widest uppercase mb-2 block">
                  {collection.season}
                </span>
                <h2 className="font-serif text-5xl font-bold mb-4">
                  {collection.title}
                </h2>
                <p className="text-xl text-gray-200 mb-8 max-w-lg">
                  {collection.desc}
                </p>
                <Button className="bg-white text-gray-900 hover:bg-rose-50 border-none">
                  Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>)}
        </div>
      </div>
    </div>;
}