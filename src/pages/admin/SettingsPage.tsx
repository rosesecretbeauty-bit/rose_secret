import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, Truck, CreditCard, Mail, Globe } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useForm } from '../../hooks/useForm';
export function SettingsPage() {
  const generalForm = useForm({
    storeName: 'Rose Secret',
    storeEmail: 'contact@rosesecret.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Beauty Street, Fashion City',
    currency: 'USD',
    timezone: 'America/New_York'
  });
  const shippingForm = useForm({
    freeShippingThreshold: '150',
    standardShipping: '10',
    expressShipping: '25',
    internationalShipping: '50'
  });
  const handleSaveGeneral = async () => {
    console.log('Save general settings:', generalForm.values);
  };
  const handleSaveShipping = async () => {
    console.log('Save shipping settings:', shippingForm.values);
  };
  return <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Configuración General
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra la configuración de tu tienda
          </p>
        </div>

        {/* General Settings */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <Store className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Información General
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Datos básicos de la tienda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nombre de la Tienda" value={generalForm.values.storeName} onChange={e => generalForm.handleChange('storeName', e.target.value)} />
            <Input label="Email de Contacto" type="email" value={generalForm.values.storeEmail} onChange={e => generalForm.handleChange('storeEmail', e.target.value)} />
            <Input label="Teléfono" value={generalForm.values.storePhone} onChange={e => generalForm.handleChange('storePhone', e.target.value)} />
            <Input label="Moneda" value={generalForm.values.currency} onChange={e => generalForm.handleChange('currency', e.target.value)} />
          </div>

          <div className="mt-6">
            <Textarea label="Dirección" value={generalForm.values.storeAddress} onChange={e => generalForm.handleChange('storeAddress', e.target.value)} rows={3} />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveGeneral}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </motion.div>

        {/* Shipping Settings */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Configuración de Envíos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Costos y políticas de envío
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Envío Gratis Desde" type="number" value={shippingForm.values.freeShippingThreshold} onChange={e => shippingForm.handleChange('freeShippingThreshold', e.target.value)} placeholder="150" />
            <Input label="Envío Estándar" type="number" value={shippingForm.values.standardShipping} onChange={e => shippingForm.handleChange('standardShipping', e.target.value)} placeholder="10" />
            <Input label="Envío Express" type="number" value={shippingForm.values.expressShipping} onChange={e => shippingForm.handleChange('expressShipping', e.target.value)} placeholder="25" />
            <Input label="Envío Internacional" type="number" value={shippingForm.values.internationalShipping} onChange={e => shippingForm.handleChange('internationalShipping', e.target.value)} placeholder="50" />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveShipping}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Métodos de Pago
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configura las opciones de pago
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[{
            name: 'Tarjeta de Crédito/Débito',
            enabled: true
          }, {
            name: 'PayPal',
            enabled: true
          }, {
            name: 'Transferencia Bancaria',
            enabled: true
          }, {
            name: 'Mercado Pago',
            enabled: false
          }].map((method, index) => <motion.div key={method.name} initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.4 + index * 0.1
          }} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {method.name}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={method.enabled} className="sr-only peer" readOnly />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                </label>
              </motion.div>)}
          </div>
        </motion.div>
      </div>
    </AdminLayout>;
}