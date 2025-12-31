import React, { useState, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, BookOpen, Star, Cloud, Sun, Moon, Wind, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { getProductImage } from '../utils/productUtils';

export function ScentJournalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts({ limit: 20 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
    loadProducts();
  }, []);

  const getProductImageById = (id: string) => {
    const product = products.find(p => p.id.toString() === id);
    return product ? getProductImage(product.images) : '/placeholder-product.png';
  };
  return <div className="min-h-screen bg-rose-50/30 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="container-custom text-center">
          <BookOpen className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
            Diario Olfativo
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Registra tus experiencias con cada fragancia, descubre patrones en
            tus gustos y construye tu memoria olfativa personal.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-serif text-2xl font-bold text-gray-900">
            Mis Memorias
          </h2>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Nueva Entrada
          </Button>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">
                Tu diario olfativo está vacío
              </h3>
              <p className="text-gray-600 mb-8">
                Comienza a registrar tus experiencias con fragancias. Cada entrada te ayudará a descubrir tus preferencias y patrones olfativos.
              </p>
              <Button onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Crear Primera Entrada
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add New Card */}
            <motion.div whileHover={{
          scale: 1.02
        }} onClick={() => setShowAddModal(true)} className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-rose-400 hover:text-rose-500 transition-colors min-h-[300px] bg-white/50">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-rose-50 transition-colors">
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-medium">Registrar nuevo aroma</span>
            </motion.div>

            {/* Journal Entries */}
            {entries.map((entry, index) => <motion.div key={entry.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }}>
                <Card className="h-full hover:shadow-premium transition-shadow duration-300 overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={getProductImageById(entry.perfumeId)} alt={entry.perfumeName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="font-serif text-xl font-bold">
                        {entry.perfumeName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <CalendarIcon className="w-3 h-3" /> {entry.date}
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-6">
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs rounded-full font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> {entry.mood}
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                        {entry.weather.includes('sol') ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}{' '}
                        {entry.weather}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                      "{entry.notes}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {entry.occasion}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < entry.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>
        )}
      </div>

      {/* Stats Section - Only show if there are entries */}
      {entries.length > 0 && (
        <div className="container-custom py-12">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-8">
            Tu Perfil Olfativo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-rose-500 to-purple-600 text-white border-none">
              <CardContent className="p-8">
                <h3 className="font-serif text-xl font-bold mb-2">
                  Notas Favoritas
                </h3>
                <p className="text-rose-100 text-sm">
                  Se mostrará cuando tengas más entradas registradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
                  Momentos del Día
                </h3>
                <p className="text-gray-500 text-sm text-center">
                  Se mostrará cuando tengas más entradas registradas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 text-white border-none">
              <CardContent className="p-8 flex flex-col justify-center h-full text-center">
                <Sparkles className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold mb-2">
                  Recomendación Semanal
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  Comienza a registrar tus experiencias para recibir recomendaciones personalizadas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>;
}