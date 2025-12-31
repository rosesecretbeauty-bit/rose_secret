import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Droplets, Info } from 'lucide-react';
interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}
export function SizeGuideModal({
  isOpen,
  onClose,
  category
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState('perfume');
  const perfumeSizes = [{
    size: '30ml',
    duration: '1-2 meses',
    sprays: '~300',
    best: false
  }, {
    size: '50ml',
    duration: '2-4 meses',
    sprays: '~500',
    best: false
  }, {
    size: '100ml',
    duration: '4-8 meses',
    sprays: '~1000',
    best: true
  }, {
    size: '150ml',
    duration: '8-12 meses',
    sprays: '~1500',
    best: false
  }];
  const concentrations = [{
    type: 'Eau de Cologne',
    concentration: '2-4%',
    duration: '2 horas',
    intensity: 'Muy ligera'
  }, {
    type: 'Eau de Toilette',
    concentration: '5-15%',
    duration: '3-4 horas',
    intensity: 'Ligera'
  }, {
    type: 'Eau de Parfum',
    concentration: '15-20%',
    duration: '6-8 horas',
    intensity: 'Moderada'
  }, {
    type: 'Parfum',
    concentration: '20-30%',
    duration: '8-12 horas',
    intensity: 'Intensa'
  }];
  return <AnimatePresence>
      {isOpen && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Ruler className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-gray-900">
                    Guía de Tamaños
                  </h2>
                  <p className="text-sm text-gray-500">
                    Encuentra el tamaño perfecto para ti
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {[{
            id: 'perfume',
            label: 'Tamaños de Perfume',
            icon: Droplets
          }, {
            id: 'concentration',
            label: 'Concentraciones',
            icon: Info
          }].map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />}
                </button>)}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {activeTab === 'perfume' && <div className="space-y-6">
                  <p className="text-gray-600 text-sm">
                    El tamaño ideal depende de tu uso diario. Aquí te ayudamos a
                    elegir:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                            Tamaño
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                            Duración Aprox.
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                            Aplicaciones
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {perfumeSizes.map((size, idx) => <tr key={idx} className={`border-b border-gray-100 ${size.best ? 'bg-rose-50' : ''}`}>
                            <td className="py-4 px-4">
                              <span className="font-semibold text-gray-900">
                                {size.size}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {size.duration}
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {size.sprays}
                            </td>
                            <td className="py-4 px-4">
                              {size.best && <span className="px-2 py-1 bg-rose-600 text-white text-xs font-semibold rounded-full">
                                  Mejor Valor
                                </span>}
                            </td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Tip:</strong> Si es tu primera vez con una
                      fragancia, te recomendamos el tamaño de 50ml. Si ya la
                      conoces y la amas, el de 100ml ofrece el mejor valor.
                    </p>
                  </div>
                </div>}

              {activeTab === 'concentration' && <div className="space-y-6">
                  <p className="text-gray-600 text-sm">
                    La concentración determina la intensidad y duración de la
                    fragancia:
                  </p>

                  <div className="space-y-4">
                    {concentrations.map((item, idx) => <motion.div key={idx} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: idx * 0.1
              }} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {item.type}
                          </h4>
                          <span className="text-sm text-rose-600 font-medium">
                            {item.concentration}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>⏱️ {item.duration}</span>
                          <span>💨 {item.intensity}</span>
                        </div>
                        {/* Intensity bar */}
                        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full" style={{
                    width: `${(idx + 1) * 25}%`
                  }} />
                        </div>
                      </motion.div>)}
                  </div>
                </div>}
            </div>
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}