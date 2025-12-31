import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Phone, MapPin, Star, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToastStore } from '../stores/toastStore';
const experts = [{
  id: 1,
  name: 'Dra. Sofia Martinez',
  specialty: 'Dermatología & Skincare',
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
  rating: 5.0,
  reviews: 124,
  availability: 'Lun - Vie'
}, {
  id: 2,
  name: 'Jean-Pierre Dubois',
  specialty: 'Maestro Perfumista',
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  rating: 4.9,
  reviews: 89,
  availability: 'Mar - Sáb'
}, {
  id: 3,
  name: 'Elena Vega',
  specialty: 'Makeup Artist',
  image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  rating: 4.8,
  reviews: 215,
  availability: 'Jue - Dom'
}];
const timeSlots = ['09:00', '10:00', '11:00', '13:00', '15:00', '16:00', '17:00'];
export function ExpertConsultationPage() {
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('video');
  const addToast = useToastStore(state => state.addToast);
  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      message: '¡Consulta reservada con éxito! Te hemos enviado un email con los detalles.'
    });
    setSelectedExpert(null);
    setSelectedDate('');
    setSelectedTime('');
  };
  return <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero */}
      <div className="bg-rose-900 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Consultas con Expertos
          </h1>
          <p className="text-rose-100 text-lg max-w-2xl mx-auto">
            Recibe asesoramiento personalizado de nuestros especialistas en
            belleza, cuidado de la piel y perfumería.
          </p>
        </div>
      </div>

      <div className="container-custom -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Experts List */}
          <div className="lg:col-span-2 space-y-6">
            {experts.map(expert => <motion.div key={expert.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all cursor-pointer ${selectedExpert === expert.id ? 'border-rose-500 ring-4 ring-rose-50' : 'border-transparent hover:border-gray-200'}`} onClick={() => setSelectedExpert(expert.id)}>
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <img src={expert.image} alt={expert.name} className="w-24 h-24 rounded-full object-cover border-4 border-rose-50" />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-between mb-2">
                      <h3 className="font-serif text-xl font-bold text-gray-900">
                        {expert.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-gray-600 font-medium text-sm">
                          {expert.rating} ({expert.reviews})
                        </span>
                      </div>
                    </div>
                    <p className="text-rose-600 font-medium mb-2">
                      {expert.specialty}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      Disponible: {expert.availability}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge variant="secondary" className="text-xs">
                        Skincare
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Anti-aging
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Rutinas
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center min-w-[100px]">
                    {selectedExpert === expert.id ? <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                      </div> : <Button variant="outline" size="sm">
                        Seleccionar
                      </Button>}
                  </div>
                </div>
              </motion.div>)}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-premium sticky top-24">
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">
                Reserva tu Cita
              </h3>

              {!selectedExpert ? <div className="text-center py-10 text-gray-500">
                  <p>Selecciona un experto para continuar</p>
                </div> : <form onSubmit={handleBooking} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Consulta
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{
                    id: 'video',
                    icon: Video,
                    label: 'Video'
                  }, {
                    id: 'phone',
                    icon: Phone,
                    label: 'Teléfono'
                  }, {
                    id: 'store',
                    icon: MapPin,
                    label: 'Tienda'
                  }].map(type => <button key={type.id} type="button" onClick={() => setConsultationType(type.id)} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${consultationType === type.id ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          <type.icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">
                            {type.label}
                          </span>
                        </button>)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha
                    </label>
                    <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map(time => <button key={time} type="button" onClick={() => setSelectedTime(time)} className={`py-2 px-1 text-sm rounded-lg border transition-all ${selectedTime === time ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {time}
                        </button>)}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between mb-4 text-sm">
                      <span className="text-gray-600">Consulta (45 min)</span>
                      <span className="font-bold text-gray-900">$75.00</span>
                    </div>
                    <Button fullWidth size="lg" disabled={!selectedDate || !selectedTime}>
                      Confirmar Reserva
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-3">
                      Cancelación gratuita hasta 24h antes
                    </p>
                  </div>
                </form>}
            </div>
          </div>
        </div>
      </div>
    </div>;
}