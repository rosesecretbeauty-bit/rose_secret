import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, CreditCard, Truck, Mail, Globe, Shield, Save, Image, Palette } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { useToastStore } from '../../stores/toastStore';
import { api } from '../../api/client';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

interface AppSetting {
  id: number;
  key: string;
  value: any;
  type: string;
  category: string;
  label: string;
  description: string | null;
  isPublic: boolean;
}

export function StoreSettings() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/app-settings') as { success: boolean; data: AppSetting[] };
      if (response.success) {
        setSettings(response.data);
        // Convertir a objeto para el formulario
        const data: Record<string, any> = {};
        response.data.forEach(setting => {
          data[setting.key] = setting.value;
        });
        setFormData(data);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al cargar configuraciones'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Preparar datos para batch update
      const batchData: Record<string, { value: any; type?: string; category?: string }> = {};
      
      settings.forEach(setting => {
        if (formData[setting.key] !== undefined) {
          batchData[setting.key] = {
            value: formData[setting.key],
            type: setting.type,
            category: setting.category
          };
        }
      });

      const response = await api.post('/app-settings/batch', batchData) as { success: boolean; message: string };
      if (response.success) {
        addToast({
          type: 'success',
          message: 'Configuraciones guardadas exitosamente'
        });
        loadSettings();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al guardar configuraciones'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getSettingValue = (key: string): any => {
    return formData[key] ?? settings.find(s => s.key === key)?.value ?? '';
  };

  if (loading) {
    return (
      <AdminLayout>
        <PremiumLoader />
      </AdminLayout>
    );
  }

  const sections = [
    {
      id: 'branding',
      title: 'Marca e Identidad',
      description: 'Logo, colores y nombre de la plataforma',
      icon: Image,
      fields: [
        { key: 'logo_url', label: 'URL del Logo', type: 'url' },
        { key: 'logo_light_url', label: 'URL del Logo Claro', type: 'url' },
        { key: 'logo_dark_url', label: 'URL del Logo Oscuro', type: 'url' },
        { key: 'favicon_url', label: 'URL del Favicon', type: 'url' },
        { key: 'platform_name', label: 'Nombre de la Plataforma', type: 'text' },
        { key: 'platform_tagline', label: 'Eslogan', type: 'text' },
        { key: 'primary_color', label: 'Color Primario', type: 'color' },
        { key: 'secondary_color', label: 'Color Secundario', type: 'color' }
      ]
    },
    {
      id: 'contact',
      title: 'Información de Contacto',
      description: 'Datos de contacto de la empresa',
      icon: Mail,
      fields: [
        { key: 'contact_email', label: 'Email de Contacto', type: 'email' },
        { key: 'contact_phone', label: 'Teléfono', type: 'tel' },
        { key: 'contact_address', label: 'Dirección', type: 'text' }
      ]
    },
    {
      id: 'shipping',
      title: 'Configuración de Envíos',
      description: 'Costos y umbrales de envío',
      icon: Truck,
      fields: [
        { key: 'free_shipping_threshold', label: 'Umbral para Envío Gratis', type: 'number' },
        { key: 'default_shipping_cost', label: 'Costo de Envío Estándar', type: 'number' }
      ]
    },
    {
      id: 'general',
      title: 'Configuración General',
      description: 'Moneda y configuraciones básicas',
      icon: Store,
      fields: [
        { key: 'currency', label: 'Moneda', type: 'text' },
        { key: 'currency_symbol', label: 'Símbolo de Moneda', type: 'text' }
      ]
    }
  ];

  return (
    <AdminLayout>
      <PermissionGuard module="settings" action="view" showError>
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                Configuración General
              </h1>
              <p className="text-gray-500 mt-1">
                Administra los ajustes generales de tu tienda
              </p>
            </div>
            <Button
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Guardar Cambios
            </Button>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-50 rounded-xl">
                        <section.icon className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {section.fields.map(field => (
                        <Input
                          key={field.key}
                          label={field.label}
                          type={field.type}
                          value={getSettingValue(field.key)}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </PermissionGuard>
    </AdminLayout>
  );
}