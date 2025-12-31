import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}
const testimonials: Testimonial[] = [{
  id: 1,
  name: 'Isabella Rossi',
  role: 'Cliente VIP',
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  content: 'La calidad de los perfumes es excepcional',
  rating: 5
}, {
  id: 2,
  name: 'Sophie Dubois',
  role: 'Amante de la perfumería',
  image: 'https://images.unsplash.com/photo-143... (placeholder)',
  content: 'Increíble servicio al cliente y entrega rápida',
  rating: 5
}, {
  id: 3,
  name: 'Elena Kovac',
  role: 'Coleccionista',
  image: 'https://images.unsplash.com/photo-1534528... (placeholder)',
  content: 'He probado muchas marcas de lujo, pero Rose Secret destaca',
  rating: 5
}];
export function TestimonialsSection() {
  return <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="container mx-auto relative z-10">
        <motion.h2 initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} className="text-center text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8">
          Encuentra tu Esencia
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
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
        }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400" />)}
                </div>
                <Quote className="h-8 w-8 text-rose-100 group-hover:text-rose-200 transition" />
              </div>

              <p className="text-gray-600 mb-8 leading://images.unsplash.com/photo-1596462502278-27b-relaxed italic">
                "{testimonial.content}"
              </p>

              <p className="text-lg font-medium mb-4">{testimonial.content}</p>

              <div>
                <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-rose-500">{testimonial.role}</p>
              </div>

              <div className="flex items-center gap-4">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500" />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>)}
        </div>
      </div>
    </section>;
}