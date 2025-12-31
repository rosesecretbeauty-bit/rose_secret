// ============================================
// Settings Component - Configuración de Usuario
// ============================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Mail, Bell, Globe, DollarSign, Loader2, Save, User, Phone, MapPin, Image as ImageIcon, FileText, Upload, Check, X, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ImageUpload } from '../ui/ImageUpload';
import { useProfileStore } from '../../stores/profileStore';
import { useToastStore } from '../../stores/toastStore';
import { useAuthStore } from '../../stores/authStore';
import { updateProfile } from '../../api/profile';

export function Settings() {
  const { settings, loading, loadSettings, updateUserSettings } = useProfileStore();
  const { user, updateUser } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    avatar: ''
  });
  const [formData, setFormData] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    language: 'es',
    currency: 'USD',
    timezone: null as string | null
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        bio: (user as any).bio || '',
        location: (user as any).location || '',
        avatar: (user as any).avatar || user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setFormData({
        email_notifications: settings.email_notifications,
        sms_notifications: settings.sms_notifications,
        marketing_emails: settings.marketing_emails,
        language: settings.language,
        currency: settings.currency,
        timezone: settings.timezone
      });
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    // Validaciones básicas
    if (!profileData.name || profileData.name.trim().length < 2) {
      addToast({
        type: 'error',
        message: 'El nombre debe tener al menos 2 caracteres'
      });
      return;
    }

    if (!profileData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      addToast({
        type: 'error',
        message: 'Por favor ingresa un email válido'
      });
      return;
    }

    try {
      setSavingProfile(true);
      
      const payload: any = {
        name: profileData.name.trim(),
        email: profileData.email.trim()
      };

      // Manejar campos opcionales
      payload.phone = profileData.phone && profileData.phone.trim() !== '' ? profileData.phone.trim() : null;
      payload.bio = profileData.bio && profileData.bio.trim() !== '' ? profileData.bio.trim() : null;
      payload.location = profileData.location && profileData.location.trim() !== '' ? profileData.location.trim() : null;
      payload.avatar = profileData.avatar && profileData.avatar.trim() !== '' ? profileData.avatar.trim() : null;
      
      const updatedUser = await updateProfile(payload);
      
      // Actualizar el usuario en el store de autenticación
      updateUser({
        ...user!,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        location: updatedUser.location,
        avatar: updatedUser.avatar
      } as any);
      
      addToast({
        type: 'success',
        message: 'Perfil actualizado exitosamente'
      });
    } catch (error: any) {
      let errorMessage = 'Error al actualizar perfil';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const firstError = error.response.data.errors[0];
        errorMessage = firstError.msg || firstError.message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Preparar payload - no enviar timezone si es null o vacío
      const payload: any = {
        email_notifications: formData.email_notifications,
        sms_notifications: formData.sms_notifications,
        marketing_emails: formData.marketing_emails,
        language: formData.language,
        currency: formData.currency
      };
      
      // Solo incluir timezone si tiene un valor
      if (formData.timezone && formData.timezone.trim() !== '') {
        payload.timezone = formData.timezone;
      } else {
        // Si queremos limpiar el timezone existente, enviar null explícitamente
        payload.timezone = null;
      }
      
      await updateUserSettings(payload);
      addToast({
        type: 'success',
        message: 'Configuración guardada exitosamente'
      });
    } catch (error: any) {
      // Mejorar mensajes de error
      let errorMessage = 'Error al guardar configuración';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Mostrar primer error de validación
        const firstError = error.response.data.errors[0];
        errorMessage = firstError.msg || firstError.message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-medium">Configuración de Cuenta</h2>
      </div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-rose-600" />
              <h3 className="font-serif text-lg font-medium">Información del Perfil</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de Perfil
              </label>
              <ImageUpload
                currentImageUrl={profileData.avatar}
                onUploadSuccess={async (url) => {
                  setProfileData({ ...profileData, avatar: url });
                  // Actualizar usuario en el store inmediatamente
                  if (user) {
                    updateUser({
                      ...user,
                      avatar: url
                    } as any);
                  }
                  // Recargar perfil completo desde el backend para sincronización total
                  const { loadProfile } = useAuthStore.getState();
                  await loadProfile().catch(err => {
                    console.error('Error recargando perfil después de subir avatar:', err);
                  });
                }}
                onUploadError={(error) => {
                  addToast({
                    type: 'error',
                    message: error
                  });
                }}
                previewType="circle"
                previewSize={120}
                uploadButtonText="Cambiar Foto de Perfil"
                disabled={savingProfile}
                uploadEndpoint="/user/upload-avatar"
              />
            </div>

            {/* Nombre y Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Nombre Completo"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  required
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>

              <div>
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="tu.email@ejemplo.com"
                  required
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Teléfono y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Número de Teléfono"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+52 55 1234 5678"
                  leftIcon={<Phone className="h-4 w-4" />}
                  helperText="Se usa para notificaciones SMS y recuperación de cuenta"
                />
              </div>

              <div>
                <Input
                  label="Ubicación"
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="Ciudad, País"
                  leftIcon={<MapPin className="h-4 w-4" />}
                  helperText="Ej: Ciudad de México, México"
                />
              </div>
            </div>

            {/* Biografía */}
            <div>
              <Textarea
                label="Biografía"
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Cuéntanos sobre ti..."
                rows={4}
                maxLength={1000}
                helperText={`${profileData.bio.length}/1000 caracteres`}
              />
            </div>

            {/* Botón Guardar */}
            <motion.div 
              className="pt-2 border-t border-gray-100"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button onClick={handleSaveProfile} disabled={savingProfile} fullWidth>
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Perfil
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-rose-600" />
              <h3 className="font-serif text-lg font-medium">Notificaciones</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.label 
              whileHover={{ x: 4 }}
              className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-500">Recibe notificaciones por correo sobre tus pedidos y cuenta</p>
              </div>
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
              />
            </motion.label>

            <motion.label 
              whileHover={{ x: 4 }}
              className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">Notificaciones por SMS</p>
                <p className="text-sm text-gray-500">Recibe notificaciones por SMS (requiere número de teléfono)</p>
              </div>
              <input
                type="checkbox"
                checked={formData.sms_notifications}
                onChange={(e) => setFormData({ ...formData, sms_notifications: e.target.checked })}
                className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
              />
            </motion.label>

            <motion.label 
              whileHover={{ x: 4 }}
              className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">Emails de Marketing</p>
                <p className="text-sm text-gray-500">Recibe correos sobre nuevos productos, promociones y ofertas especiales</p>
              </div>
              <input
                type="checkbox"
                checked={formData.marketing_emails}
                onChange={(e) => setFormData({ ...formData, marketing_emails: e.target.checked })}
                className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
              />
            </motion.label>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-rose-600" />
              <h3 className="font-serif text-lg font-medium">Preferencias</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="MXN">MXN ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona Horaria
              </label>
              <select
                value={formData.timezone || ''}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
              >
                <option value="">Seleccionar zona horaria</option>
                <optgroup label="América">
                  <option value="America/New_York">Hora del Este (EE. UU. y Canadá)</option>
                  <option value="America/Chicago">Hora Central (EE. UU. y Canadá)</option>
                  <option value="America/Denver">Hora de la Montaña (EE. UU. y Canadá)</option>
                  <option value="America/Los_Angeles">Hora del Pacífico (EE. UU. y Canadá)</option>
                  <option value="America/Mexico_City">Ciudad de México</option>
                  <option value="America/Bogota">Bogotá</option>
                  <option value="America/Buenos_Aires">Buenos Aires</option>
                  <option value="America/Santiago">Santiago</option>
                  <option value="America/Sao_Paulo">São Paulo</option>
                </optgroup>
                <optgroup label="Europa">
                  <option value="Europe/London">Londres</option>
                  <option value="Europe/Paris">París</option>
                  <option value="Europe/Madrid">Madrid</option>
                  <option value="Europe/Rome">Roma</option>
                  <option value="Europe/Berlin">Berlín</option>
                  <option value="Europe/Moscow">Moscú</option>
                </optgroup>
                <optgroup label="Asia">
                  <option value="Asia/Tokyo">Tokio</option>
                  <option value="Asia/Shanghai">Shanghái</option>
                  <option value="Asia/Hong_Kong">Hong Kong</option>
                  <option value="Asia/Dubai">Dubái</option>
                  <option value="Asia/Kolkata">Kolkata</option>
                </optgroup>
                <optgroup label="Oceanía">
                  <option value="Australia/Sydney">Sídney</option>
                  <option value="Pacific/Auckland">Auckland</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Se usa para programación y notificaciones basadas en tiempo
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Actions */}
      <motion.div 
        className="flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

