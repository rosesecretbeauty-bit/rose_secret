import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, CheckCircle, Truck, MapPin, Clock, Mail } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
export function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Mock tracking data
    setTrackingResult({
      orderNumber: orderNumber,
      status: 'in_transit',
      estimatedDelivery: '25 de Enero, 2024',
      carrier: 'DHL Express',
      trackingNumber: 'DHL1234567890',
      timeline: [{
        status: 'Pedido Confirmado',
        date: '20 de Enero, 2024',
        time: '10:30',
        completed: true,
        icon: CheckCircle
      }, {
        status: 'Preparando Envío',
        date: '21 de Enero, 2024',
        time: '14:15',
        completed: true,
        icon: Package
      }, {
        status: 'En Tránsito',
        date: '22 de Enero, 2024',
        time: '09:00',
        completed: true,
        icon: Truck,
        current: true
      }, {
        status: 'En Reparto',
        date: '25 de Enero, 2024',
        time: 'Estimado',
        completed: false,
        icon: MapPin
      }, {
        status: 'Entregado',
        date: 'Pendiente',
        time: '',
        completed: false,
        icon: CheckCircle
      }]
    });
    setIsTracking(false);
  };
  return <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-16">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-6">
            <Package className="h-8 w-8 text-rose-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Rastrear Pedido
          </h1>
          <p className="text-lg text-gray-600">
            Ingresa tu número de pedido y email para ver el estado de tu envío
          </p>
        </motion.div>

        {/* Tracking Form */}
        {!trackingResult && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }} className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
            <form onSubmit={handleTrack} className="space-y-6">
              <Input label="Número de Pedido" placeholder="RS-2024-001" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required leftIcon={<Search className="h-5 w-5" />} />

              <Input label="Email de Confirmación" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required leftIcon={<Mail className="h-5 w-5" />} />

              <Button type="submit" size="lg" fullWidth isLoading={isTracking} leftIcon={<Search className="h-5 w-5" />}>
                Rastrear Pedido
              </Button>
            </form>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Puedes encontrar tu número de pedido en
                el email de confirmación que recibiste después de tu compra.
              </p>
            </div>
          </motion.div>}

        {/* Tracking Result */}
        {trackingResult && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-6">
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Pedido {trackingResult.orderNumber}
                  </h2>
                  <p className="text-gray-600">
                    {trackingResult.carrier} • {trackingResult.trackingNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Entrega estimada</p>
                  <p className="text-lg font-bold text-rose-600">
                    {trackingResult.estimatedDelivery}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
                <Truck className="h-4 w-4" />
                <span className="font-medium">En Tránsito</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-8">
                Estado del Envío
              </h3>

              <div className="space-y-8">
                {trackingResult.timeline.map((step: any, index: number) => <div key={index} className="relative flex gap-6">
                    {/* Line */}
                    {index < trackingResult.timeline.length - 1 && <div className={`absolute left-6 top-12 bottom-0 w-0.5 ${step.completed ? 'bg-rose-500' : 'bg-gray-200'}`} />}

                    {/* Icon */}
                    <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${step.current ? 'bg-rose-500 ring-4 ring-rose-100' : step.completed ? 'bg-rose-500' : 'bg-gray-200'}`}>
                      <step.icon className={`h-6 w-6 ${step.completed || step.current ? 'text-white' : 'text-gray-400'}`} />
                      {step.current && <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-75" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <h4 className={`font-bold mb-1 ${step.current ? 'text-rose-600' : 'text-gray-900'}`}>
                        {step.status}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {step.date} {step.time && `• ${step.time}`}
                      </p>
                    </div>
                  </div>)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" fullWidth onClick={() => setTrackingResult(null)}>
                Rastrear Otro Pedido
              </Button>
              <Link to="/contact" className="flex-1">
                <Button variant="secondary" fullWidth>
                  Contactar Soporte
                </Button>
              </Link>
            </div>
          </motion.div>}

        {/* Help Section */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="mt-12 bg-gradient-to-br from-rose-50 to-lavender-50 rounded-2xl p-8 text-center border border-rose-100">
          <Clock className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¿Necesitas Ayuda?
          </h3>
          <p className="text-gray-600 mb-6">
            Si tienes problemas para rastrear tu pedido o tienes preguntas,
            estamos aquí para ayudarte
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/faq">
              <Button variant="outline">Ver FAQ</Button>
            </Link>
            <Link to="/contact">
              <Button>Contactar Soporte</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>;
}