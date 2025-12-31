import React from 'react';
import { motion } from 'framer-motion';
import { Check, Truck, Package, MapPin } from 'lucide-react';
export function OrderTrackingMap() {
  const steps = [{
    id: 1,
    label: 'Order Placed',
    date: 'Jan 15, 10:30 AM',
    completed: true
  }, {
    id: 2,
    label: 'Processing',
    date: 'Jan 15, 2:00 PM',
    completed: true
  }, {
    id: 3,
    label: 'Shipped',
    date: 'Jan 16, 9:00 AM',
    completed: true
  }, {
    id: 4,
    label: 'Out for Delivery',
    date: 'Today, 8:45 AM',
    completed: true,
    current: true
  }, {
    id: 5,
    label: 'Delivered',
    date: 'Estimated 2:00 PM',
    completed: false
  }];
  return <div className="space-y-8">
      {/* Map Placeholder */}
      <div className="relative h-64 md:h-80 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=600x300&sensor=false')] bg-cover bg-center opacity-50 grayscale" />

        {/* Mock Route Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-md h-2 bg-gray-300 rounded-full overflow-hidden">
            <motion.div className="h-full bg-rose-600" initial={{
            width: '0%'
          }} animate={{
            width: '75%'
          }} transition={{
            duration: 2,
            ease: 'easeInOut'
          }} />
          </div>
          <motion.div className="absolute p-2 bg-white rounded-full shadow-lg text-rose-600" initial={{
          left: '20%'
        }} animate={{
          left: '65%'
        }} transition={{
          duration: 2,
          ease: 'easeInOut'
        }}>
            <Truck className="h-6 w-6" />
          </motion.div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

        <div className="space-y-8">
          {steps.map((step, index) => <div key={step.id} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="hidden md:block w-1/2" />

              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center transition-colors bg-white">
                <div className={`w-full h-full rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                  {step.completed && <Check className="h-3 w-3" />}
                </div>
              </div>

              <div className="pl-12 md:pl-0 md:w-1/2 md:px-8">
                <div className={`bg-white p-4 rounded-xl border ${step.current ? 'border-rose-200 shadow-md ring-1 ring-rose-100' : 'border-gray-100'}`}>
                  <p className="font-bold text-gray-900">{step.label}</p>
                  <p className="text-sm text-gray-500">{step.date}</p>
                  {step.current && <p className="text-xs text-rose-600 font-medium mt-2 animate-pulse">
                      Happening Now
                    </p>}
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}