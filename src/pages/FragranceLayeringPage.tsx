import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
export function FragranceLayeringPage() {
  return <div className="bg-white min-h-screen">
      <div className="bg-gradient-to-b from-rose-50 to-white py-20 text-center">
        <div className="container-custom">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="max-w-3xl mx-auto">
            <Layers className="h-12 w-12 text-rose-400 mx-auto mb-6" />
            <h1 className="font-serif text-5xl font-bold text-gray-900 mb-6">
              The Art of Layering
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Create a bespoke scent that is uniquely yours. Fragrance layering
              allows you to mix different perfumes to create a signature aroma.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-20">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[{
          title: '1. Choose a Base',
          desc: 'Start with a heavier scent. Woods, musks, and vanilla notes work best as a foundation.',
          color: 'bg-amber-100 text-amber-800'
        }, {
          title: '2. Add the Heart',
          desc: 'Layer a floral or spicy scent to add complexity and character to your mix.',
          color: 'bg-rose-100 text-rose-800'
        }, {
          title: '3. Top it Off',
          desc: 'Finish with a light, citrusy or fresh scent that will be the first impression.',
          color: 'bg-blue-100 text-blue-800'
        }].map((step, i) => <GlassCard key={i} className="p-8 text-center" hover>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 ${step.color} font-bold text-xl`}>
                {i + 1}
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.desc}</p>
            </GlassCard>)}
        </div>

        <div className="bg-gray-900 text-white rounded-3xl p-12 relative overflow-hidden">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-6">
                Perfect Combinations
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Not sure where to start? Try our curated pairings designed by
                our master perfumers.
              </p>
              <Button className="bg-white text-gray-900 hover:bg-rose-50">
                Explore Combinations
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-rose-500 rounded-full opacity-80" />
                  <Plus className="text-white/50" />
                  <div className="w-12 h-12 bg-orange-500 rounded-full opacity-80" />
                </div>
                <p className="text-center font-medium">Rose + Citrus</p>
                <p className="text-center text-sm text-gray-400">
                  Fresh & Romantic
                </p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-700 rounded-full opacity-80" />
                  <Plus className="text-white/50" />
                  <div className="w-12 h-12 bg-purple-500 rounded-full opacity-80" />
                </div>
                <p className="text-center font-medium">Oud + Vanilla</p>
                <p className="text-center text-sm text-gray-400">
                  Warm & Sensual
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}