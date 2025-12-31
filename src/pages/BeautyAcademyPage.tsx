import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
const tutorials = [{
  id: 1,
  title: 'The 10-Step Korean Skincare Routine Explained',
  category: 'Skincare',
  duration: '15 min read',
  level: 'Intermediate',
  image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
  video: true
}, {
  id: 2,
  title: 'Mastering the Perfect Winged Eyeliner',
  category: 'Makeup',
  duration: '8 min video',
  level: 'Beginner',
  image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
  video: true
}, {
  id: 3,
  title: 'Understanding Fragrance Notes: Top, Heart, Base',
  category: 'Fragrance',
  duration: '10 min read',
  level: 'Advanced',
  image: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=800',
  video: false
}, {
  id: 4,
  title: "Morning vs. Evening Skincare: What's the Difference?",
  category: 'Skincare',
  duration: '12 min read',
  level: 'Beginner',
  image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
  video: false
}];
export function BeautyAcademyPage() {
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-16 md:py-24">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-rose-600 font-medium tracking-wider uppercase text-sm mb-4 block">
            Rose Secret Academy
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master the Art of Beauty
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Expert tutorials, in-depth guides, and professional tips to help you
            get the most out of your beauty routine.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['All', 'Skincare', 'Makeup', 'Fragrance', 'Wellness'].map(cat => <button key={cat} className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${cat === 'All' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat}
                </button>)}
          </div>
        </div>
      </div>

      {/* Featured Tutorial */}
      <div className="container-custom -mt-10 relative z-10 mb-16">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
          <div className="relative h-64 md:h-auto">
            <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800" alt="Featured" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer">
              <div className="w-16 h-16 bg-white/30 backdrop-blur rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                <Play className="h-6 w-6 text-white fill-current" />
              </div>
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <Badge className="w-fit mb-4 bg-rose-100 text-rose-800 border-none">
              Featured Course
            </Badge>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mb-4">
              The Ultimate Guide to Glass Skin
            </h2>
            <p className="text-gray-600 mb-6">
              Learn the secrets behind the viral "glass skin" trend. We break
              down the products, techniques, and lifestyle habits needed to
              achieve that luminous, poreless glow.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> 25 min
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> 8 Lessons
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" /> 4.9
                (1.2k)
              </span>
            </div>
            <Button size="lg">Start Learning</Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutorials.map(tutorial => <motion.div key={tutorial.id} whileHover={{
          y: -5
        }} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
              <div className="relative aspect-video">
                <img src={tutorial.image} alt={tutorial.title} className="w-full h-full object-cover" />
                {tutorial.video && <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Play className="h-3 w-3 fill-current" /> Video
                  </div>}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-900">
                  {tutorial.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {tutorial.duration}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                    {tutorial.level}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-rose-600 transition-colors cursor-pointer">
                  {tutorial.title}
                </h3>
                <Button variant="outline" fullWidth size="sm" className="mt-2">
                  Read Article
                </Button>
              </div>
            </motion.div>)}
        </div>
      </div>
    </div>;
}