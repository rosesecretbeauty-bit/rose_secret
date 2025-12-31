import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Anchor } from 'lucide-react';
interface FragranceNotesPyramidProps {
  notes: {
    top?: string[];
    heart?: string[];
    base?: string[];
  };
}
export function FragranceNotesPyramid({
  notes
}: FragranceNotesPyramidProps) {
  // Validar que notes exista y tenga al menos una propiedad
  if (!notes || (!notes.top && !notes.heart && !notes.base)) {
    return null;
  }
  const layers = [{
    key: 'top',
    label: 'Notas de Salida',
    sublabel: 'Primeras impresiones (0-30 min)',
    notes: notes.top || [],
    icon: Sparkles,
    color: 'from-amber-400 to-yellow-300',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  }, {
    key: 'heart',
    label: 'Notas de Corazón',
    sublabel: 'El alma del perfume (30 min - 4h)',
    notes: notes.heart || [],
    icon: Heart,
    color: 'from-rose-500 to-pink-400',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200'
  }, {
    key: 'base',
    label: 'Notas de Fondo',
    sublabel: 'La firma duradera (4h+)',
    notes: notes.base || [],
    icon: Anchor,
    color: 'from-amber-800 to-amber-600',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-300'
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true
  }} className="bg-gradient-to-br from-rose-50/50 to-champagne/30 rounded-2xl p-8 border border-rose-100">
      <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2 text-center">
        Pirámide Olfativa
      </h3>
      <p className="text-gray-600 text-center mb-8 text-sm">
        Descubre la composición de esta fragancia
      </p>

      <div className="relative max-w-md mx-auto">
        {/* Pyramid Visual */}
        <div className="space-y-4">
          {layers.filter(layer => layer.notes.length > 0).map((layer, index) => <motion.div key={layer.key} initial={{
          opacity: 0,
          x: -20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.15
        }} className={`${layer.bgColor} rounded-xl p-5 border ${layer.borderColor} relative overflow-hidden`} style={{
          marginLeft: `${index * 8}%`,
          marginRight: `${index * 8}%`
        }}>
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${layer.color}`} />

              <div className="flex items-start gap-4 pl-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${layer.color} text-white shadow-lg`}>
                  <layer.icon className="h-5 w-5" />
                </div>

                <div className="flex-1">
                  <h4 className={`font-semibold ${layer.textColor} mb-1`}>
                    {layer.label}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">{layer.sublabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {layer.notes.map((note, noteIndex) => <motion.span key={note} initial={{
                  opacity: 0,
                  scale: 0.8
                }} whileInView={{
                  opacity: 1,
                  scale: 1
                }} viewport={{
                  once: true
                }} transition={{
                  delay: index * 0.15 + noteIndex * 0.05
                }} className="px-3 py-1 bg-white/80 rounded-full text-sm text-gray-700 border border-gray-200 shadow-sm">
                        {note}
                      </motion.span>)}
                  </div>
                </div>
              </div>
            </motion.div>)}
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-champagne/40 to-transparent rounded-full blur-2xl" />
      </div>
    </motion.div>;
}