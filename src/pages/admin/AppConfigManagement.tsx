import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { getAppConfig, updateAppConfig, AppConfig } from '../../api/appConfig';
import { useToastStore } from '../../stores/toastStore';
import { useForm } from '../../hooks/useForm';

interface AppConfigFormData {
  active: boolean;
  android_url: string;
  ios_url: string;
  web_url: string;
  app_name: string;
  app_description: string;
  app_rating: string;
  app_reviews_count: string;
  qr_code_url: string;
  banner_text: string;
  interstitial_enabled: boolean;
  interstitial_trigger_views: string;
}

const initialValues: AppConfigFormData = {
  active: false,
  android_url: '',
  ios_url: '',
  web_url: '',
  app_name: 'Rose Secret',
  app_description: '',
  app_rating: '',
  app_reviews_count: '',
  qr_code_url: '',
  banner_text: '',
  interstitial_enabled: false,
  interstitial_trigger_views: '3'
};

const validationRules = {
  app_name: { required: true },
  interstitial_trigger_views: {
    required: true,
    custom: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1) {
        return 'Debe ser mayor a 0';
      }
      return null;
    }
  }
};

export function AppConfigManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues
  } = useForm<AppConfigFormData>(initialValues, validationRules);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const config = await getAppConfig();
      
      if (config) {
        setValues({
          active: config.active || false,
          android_url: config.android_url || '',
          ios_url: config.ios_url || '',
          web_url: config.web_url || '',
          app_name: config.app_name || 'Rose Secret',
          app_description: config.app_description || '',
          app_rating: config.app_rating?.toString() || '',
          app_reviews_count: config.app_reviews_count?.toString() || '',
          qr_code_url: config.qr_code_url || '',
          banner_text: config.banner_text || '',
          interstitial_enabled: config.interstitial_enabled || false,
          interstitial_trigger_views: config.interstitial_trigger_views?.toString() || '3'
        });
      }
    } catch (error: any) {
      console.error('Error cargando configuración:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al cargar configuración'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    await handleSubmit(async (formValues) => {
      try {
        setIsSaving(true);
        
        const configData: Partial<AppConfig> = {
          active: formValues.active,
          android_url: formValues.android_url || undefined,
          ios_url: formValues.ios_url || undefined,
          web_url: formValues.web_url || undefined,
          app_name: formValues.app_name,
          app_description: formValues.app_description || undefined,
          app_rating: formValues.app_rating ? parseFloat(formValues.app_rating) : undefined,
          app_reviews_count: formValues.app_reviews_count ? parseInt(formValues.app_reviews_count) : undefined,
          qr_code_url: formValues.qr_code_url || undefined,
          banner_text: formValues.banner_text || undefined,
          interstitial_enabled: formValues.interstitial_enabled,
          interstitial_trigger_views: parseInt(formValues.interstitial_trigger_views)
        };

        await updateAppConfig(configData);
        
        addToast({
          type: 'success',
          message: 'Configuración guardada exitosamente'
        });
      } catch (error: any) {
        console.error('Error guardando configuración:', error);
        addToast({
          type: 'error',
          message: error.message || 'Error al guardar configuración'
        });
      } finally {
        setIsSaving(false);
      }
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              Configuración de App Móvil
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona la configuración para la descarga de la app móvil
            </p>
          </div>
        </div>

        {/* Alert */}
        {values.active && (!values.android_url && !values.ios_url && !values.web_url) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                App activa sin URLs
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                La app está marcada como activa pero no hay URLs configuradas. Por favor, agrega al menos una URL (Android, iOS o Web).
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-6">
          {/* Estado General */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-rose-100 dark:bg-rose-900/20 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Estado General
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={values.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Activar sección de descarga de app
                </label>
              </div>
            </div>
          </motion.div>

          {/* URLs de Descarga */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              URLs de Descarga
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="URL de Google Play Store (Android)"
                name="android_url"
                value={values.android_url}
                onChange={(e) => handleChange('android_url', e.target.value)}
                onBlur={() => handleBlur('android_url')}
                error={touched.android_url ? errors.android_url : undefined}
                placeholder="https://play.google.com/store/apps/..."
                type="url"
              />

              <Input
                label="URL de App Store (iOS)"
                name="ios_url"
                value={values.ios_url}
                onChange={(e) => handleChange('ios_url', e.target.value)}
                onBlur={() => handleBlur('ios_url')}
                error={touched.ios_url ? errors.ios_url : undefined}
                placeholder="https://apps.apple.com/app/..."
                type="url"
              />

              <div className="md:col-span-2">
                <Input
                  label="URL de PWA o Web App"
                  name="web_url"
                  value={values.web_url}
                  onChange={(e) => handleChange('web_url', e.target.value)}
                  onBlur={() => handleBlur('web_url')}
                  error={touched.web_url ? errors.web_url : undefined}
                  placeholder="https://app.rosesecret.com"
                  type="url"
                />
              </div>
            </div>
          </motion.div>

          {/* Información de la App */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Información de la App
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nombre de la App *"
                  name="app_name"
                  value={values.app_name}
                  onChange={(e) => handleChange('app_name', e.target.value)}
                  onBlur={() => handleBlur('app_name')}
                  error={touched.app_name ? errors.app_name : undefined}
                  placeholder="Rose Secret"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Descripción"
                  name="app_description"
                  value={values.app_description}
                  onChange={(e) => handleChange('app_description', e.target.value)}
                  onBlur={() => handleBlur('app_description')}
                  placeholder="La mejor experiencia de compra de lujo"
                  rows={3}
                />
              </div>

              <Input
                label="Rating (0-5)"
                name="app_rating"
                value={values.app_rating}
                onChange={(e) => handleChange('app_rating', e.target.value)}
                onBlur={() => handleBlur('app_rating')}
                error={touched.app_rating ? errors.app_rating : undefined}
                placeholder="4.9"
                type="number"
                min="0"
                max="5"
                step="0.1"
              />

              <Input
                label="Cantidad de Reviews"
                name="app_reviews_count"
                value={values.app_reviews_count}
                onChange={(e) => handleChange('app_reviews_count', e.target.value)}
                onBlur={() => handleBlur('app_reviews_count')}
                error={touched.app_reviews_count ? errors.app_reviews_count : undefined}
                placeholder="1250"
                type="number"
                min="0"
              />
            </div>
          </motion.div>

          {/* Banner y Contenido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Banner y Contenido
            </h2>

            <div className="space-y-6">
              <Input
                label="URL del Código QR"
                name="qr_code_url"
                value={values.qr_code_url}
                onChange={(e) => handleChange('qr_code_url', e.target.value)}
                onBlur={() => handleBlur('qr_code_url')}
                error={touched.qr_code_url ? errors.qr_code_url : undefined}
                placeholder="https://example.com/qr-code.png"
                type="url"
              />

              <Input
                label="Texto del Banner"
                name="banner_text"
                value={values.banner_text}
                onChange={(e) => handleChange('banner_text', e.target.value)}
                onBlur={() => handleBlur('banner_text')}
                error={touched.banner_text ? errors.banner_text : undefined}
                placeholder="Descarga nuestra app y obtén beneficios exclusivos"
              />
            </div>
          </motion.div>

          {/* Configuración de Intersticial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Configuración de Intersticial
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="interstitial_enabled"
                  checked={values.interstitial_enabled}
                  onChange={(e) => handleChange('interstitial_enabled', e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="interstitial_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mostrar intersticial en dispositivos móviles
                </label>
              </div>

              {values.interstitial_enabled && (
                <Input
                  label="Vistas necesarias para mostrar intersticial *"
                  name="interstitial_trigger_views"
                  value={values.interstitial_trigger_views}
                  onChange={(e) => handleChange('interstitial_trigger_views', e.target.value)}
                  onBlur={() => handleBlur('interstitial_trigger_views')}
                  error={touched.interstitial_trigger_views ? errors.interstitial_trigger_views : undefined}
                  placeholder="3"
                  type="number"
                  min="1"
                  required
                  helperText="Número de páginas visitadas antes de mostrar el intersticial"
                />
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={loadConfig}
              disabled={isSaving || isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSaving || isSubmitting}
              disabled={isSaving || isSubmitting}
            >
              <Save className="h-5 w-5 mr-2" />
              Guardar Configuración
            </Button>
          </motion.div>
        </form>
      </div>
    </AdminLayout>
  );
}

