import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
const lookbooks = [{
  id: 1,
  title: 'Midnight in Paris',
  season: 'Fall/Winter 2024',
  description: 'Dark florals, velvet textures, and intoxicating scents inspired by Parisian nights.',
  image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200',
  color: 'from-purple-900 to-black'
}, {
  id: 2,
  title: 'Mediterranean Summer',
  season: 'Spring/Summer 2024',
  description: 'Sun-drenched citrus, azure waters, and effortless glow for your endless summer.',
  image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=1200',
  color: 'from-blue-500 to-teal-400'
}, {
  id: 3,
  title: 'Botanical Garden',
  season: 'Spring 2024',
  description: "Fresh blooms, dewy skin, and pastel hues straight from nature's palette.",
  image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200',
  color: 'from-green-600 to-emerald-800'
}];
export function LookbooksPage() {
  return <div className="min-h-screen bg-white">
      <div className="py-20 text-center">
        <span className="text-rose-600 font-medium tracking-wider uppercase text-sm mb-4 block">
          Editorial
        </span>
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-gray-900 mb-6">
          The Lookbooks
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Immerse yourself in our seasonal stories. Curated collections, styling
          inspiration, and the mood of the moment.
        </p>
      </div>

      <div className="space-y-0">
        {lookbooks.map((book, index) => <div key={book.id} className="relative h-[80vh] w-full overflow-hidden group cursor-pointer">
            <img src={book.image} alt={book.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl px-6 translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                <p className="text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                  {book.season}
                </p>
                <h2 className="font-serif text-5xl md:text-8xl font-bold mb-6 leading-tight">
                  {book.title}
                </h2>
                <p className="text-lg md:text-2xl font-light max-w-2xl mx-auto mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">
                  {book.description}
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-6">
                    Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}