import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Image, Palette, Save, Eye } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { useToastStore } from '../../stores/toastStore';
import { api } from '../../api/client';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

interface EmailConfig {
  id?: number;
  headerLogoUrl: string | null;
  headerBannerUrl: string | null;
  headerBackgroundColor: string;
  headerTextColor: string;
  footerText: string | null;
  footerLinks: any;
  footerBackgroundColor: string;
  footerTextColor: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  companyAddress: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  socialMedia: any;
}

export function EmailConfigPage() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const [formData, setFormData] = useState<EmailConfig>({
    headerLogoUrl: null,
    headerBannerUrl: null,
    headerBackgroundColor: '#ec4899',
    headerTextColor: '#ffffff',
    footerText: null,
    footerLinks: null,
    footerBackgroundColor: '#f9fafb',
    footerTextColor: '#6b7280',
    primaryColor: '#ec4899',
    secondaryColor: '#f43f5e',
    companyName: 'Rose Secret',
    companyAddress: null,
    companyPhone: null,
    companyEmail: null,
    socialMedia: null
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/email-config') as { success: boolean; data: EmailConfig };
      if (response.success && response.data) {
        setConfig(response.data);
        setFormData(response.data);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al cargar configuración'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/email-config', formData) as { success: boolean; message: string };
      if (response.success) {
        addToast({
          type: 'success',
          message: 'Configuración de email guardada exitosamente'
        });
        loadConfig();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al guardar configuración'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <PremiumLoader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PermissionGuard module="settings" action="view" showError>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                Configuración de Emails
              </h1>
              <p className="text-gray-500 mt-1">
                Personaliza el diseño y contenido de tus correos electrónicos
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                leftIcon={<Eye className="h-4 w-4" />}
              >
                {previewMode ? 'Editar' : 'Vista Previa'}
              </Button>
              <Button
                onClick={handleSave}
                isLoading={saving}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>

          {previewMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa del Email</CardTitle>
                <CardDescription>
                  Así se verá el header y footer en los emails enviados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header Preview */}
                  <div
                    style={{
                      backgroundColor: formData.headerBackgroundColor,
                      color: formData.headerTextColor,
                      padding: '40px',
                      textAlign: 'center'
                    }}
                  >
                    {formData.headerBannerUrl ? (
                      <img
                        src={formData.headerBannerUrl}
                        alt="Banner"
                        style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }}
                      />
                    ) : formData.headerLogoUrl ? (
                      <img
                        src={formData.headerLogoUrl}
                        alt="Logo"
                        style={{ maxWidth: '200px', height: 'auto', marginBottom: '20px' }}
                      />
                    ) : (
                      <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 'bold' }}>
                        {formData.companyName}
                      </h1>
                    )}
                  </div>

                  {/* Content Preview */}
                  <div style={{ padding: '40px', backgroundColor: '#ffffff' }}>
                    <p style={{ color: '#1f2937', fontSize: '18px', marginBottom: '20px' }}>
                      Contenido del email aquí...
                    </p>
                  </div>

                  {/* Footer Preview */}
                  <div
                    style={{
                      backgroundColor: formData.footerBackgroundColor,
                      color: formData.footerTextColor,
                      padding: '30px',
                      textAlign: 'center',
                      borderTop: '1px solid #e5e7eb'
                    }}
                  >
                    {formData.footerText && (
                      <p style={{ fontSize: '14px', margin: '0 0 10px 0' }}>
                        {formData.footerText}
                      </p>
                    )}
                    {formData.companyEmail && (
                      <p style={{ fontSize: '12px', margin: '10px 0 0 0' }}>
                        Email: <a href={`mailto:${formData.companyEmail}`} style={{ color: formData.primaryColor }}>
                          {formData.companyEmail}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Header Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg">
                      <Image className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <CardTitle>Header del Email</CardTitle>
                      <CardDescription>Logo, banner y colores del encabezado</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="URL del Logo"
                    type="url"
                    value={formData.headerLogoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, headerLogoUrl: e.target.value || null })}
                    placeholder="https://ejemplo.com/logo.png"
                    helperText="Se muestra si no hay banner"
                  />
                  <Input
                    label="URL del Banner"
                    type="url"
                    value={formData.headerBannerUrl || ''}
                    onChange={(e) => setFormData({ ...formData, headerBannerUrl: e.target.value || null })}
                    placeholder="https://ejemplo.com/banner.png"
                    helperText="Tiene prioridad sobre el logo"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Color de Fondo"
                      type="color"
                      value={formData.headerBackgroundColor}
                      onChange={(e) => setFormData({ ...formData, headerBackgroundColor: e.target.value })}
                    />
                    <Input
                      label="Color del Texto"
                      type="color"
                      value={formData.headerTextColor}
                      onChange={(e) => setFormData({ ...formData, headerTextColor: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Footer Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Footer del Email</CardTitle>
                      <CardDescription>Texto, colores y enlaces del pie</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    label="Texto del Footer"
                    value={formData.footerText || ''}
                    onChange={(e) => setFormData({ ...formData, footerText: e.target.value || null })}
                    rows={3}
                    placeholder="© 2025 Rose Secret. Todos los derechos reservados."
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Color de Fondo"
                      type="color"
                      value={formData.footerBackgroundColor}
                      onChange={(e) => setFormData({ ...formData, footerBackgroundColor: e.target.value })}
                    />
                    <Input
                      label="Color del Texto"
                      type="color"
                      value={formData.footerTextColor}
                      onChange={(e) => setFormData({ ...formData, footerTextColor: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Colors Configuration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Palette className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Colores Principales</CardTitle>
                      <CardDescription>Colores para botones y elementos</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Color Primario"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    helperText="Usado en botones y enlaces"
                  />
                  <Input
                    label="Color Secundario"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    helperText="Usado en gradientes"
                  />
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Información de la Empresa</CardTitle>
                      <CardDescription>Datos de contacto en emails</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Nombre de la Empresa"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                  <Input
                    label="Email de Contacto"
                    type="email"
                    value={formData.companyEmail || ''}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value || null })}
                  />
                  <Input
                    label="Teléfono"
                    value={formData.companyPhone || ''}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value || null })}
                  />
                  <Textarea
                    label="Dirección"
                    value={formData.companyAddress || ''}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value || null })}
                    rows={2}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </PermissionGuard>
    </AdminLayout>
  );
}

