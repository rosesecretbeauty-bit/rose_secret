import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Save, AlertTriangle, Info, Lock, Unlock, Clock, Activity } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { useToastStore } from '../../stores/toastStore';
import { api } from '../../api/client';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { Tooltip } from '../../components/ui/Tooltip';

interface SecuritySettings {
  id?: number;
  ipBlockingEnabled: boolean;
  ipBlockDurationMinutes: number;
  maxFailedAttempts: number;
  suspiciousActivityWindowMinutes: number;
  rateLimitEnabled: boolean;
  abuseDetectionEnabled: boolean;
  bruteForceProtectionEnabled: boolean;
}

export function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const [formData, setFormData] = useState<SecuritySettings>({
    ipBlockingEnabled: true,
    ipBlockDurationMinutes: 15,
    maxFailedAttempts: 5,
    suspiciousActivityWindowMinutes: 15,
    rateLimitEnabled: true,
    abuseDetectionEnabled: true,
    bruteForceProtectionEnabled: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/security-settings') as { success: boolean; data: SecuritySettings };
      if (response.success && response.data) {
        setSettings(response.data);
        setFormData(response.data);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al cargar configuración de seguridad'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put('/security-settings', formData) as { success: boolean; message: string };
      if (response.success) {
        addToast({
          type: 'success',
          message: 'Configuración de seguridad guardada exitosamente. Los cambios se aplicarán inmediatamente.'
        });
        loadSettings();
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

  const handleToggle = (key: keyof SecuritySettings) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
                Configuración de Seguridad
              </h1>
              <p className="text-gray-500 mt-1">
                Gestiona el bloqueo de IP y protecciones de seguridad
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

          {/* Warning when IP blocking is disabled */}
          {!formData.ipBlockingEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
            >
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                    Bloqueo de IP Desactivado
                  </h3>
                  <p className="text-sm text-yellow-700">
                    El sistema no bloqueará IPs automáticamente. Esto es útil para entornos de pruebas, 
                    pero reduce la seguridad en producción.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* IP Blocking Configuration */}
          <Card>
            <CardHeader className="border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 rounded-xl">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <CardTitle>Bloqueo de IP</CardTitle>
                  <CardDescription>
                    Controla el bloqueo automático de IPs por actividad sospechosa
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ipBlockingEnabled}
                      onChange={() => handleToggle('ipBlockingEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">
                    {formData.ipBlockingEnabled ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Lock className="h-4 w-4" /> Activado
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Unlock className="h-4 w-4" /> Desactivado
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Duración del Bloqueo (minutos)
                    </label>
                    <Tooltip content="Tiempo que una IP permanecerá bloqueada después de exceder el límite de intentos">
                      <span>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </span>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    max="1440"
                    value={formData.ipBlockDurationMinutes}
                    onChange={(e) => setFormData({ ...formData, ipBlockDurationMinutes: parseInt(e.target.value) || 15 })}
                    disabled={!formData.ipBlockingEnabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rango: 1-1440 minutos (24 horas máximo)
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Máximo de Intentos Fallidos
                    </label>
                    <Tooltip content="Número de intentos fallidos antes de bloquear la IP">
                      <span>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </span>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxFailedAttempts}
                    onChange={(e) => setFormData({ ...formData, maxFailedAttempts: parseInt(e.target.value) || 5 })}
                    disabled={!formData.ipBlockingEnabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rango: 1-20 intentos
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Ventana de Detección (minutos)
                    </label>
                    <Tooltip content="Período de tiempo para detectar actividad sospechosa">
                      <span>
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </span>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.suspiciousActivityWindowMinutes}
                    onChange={(e) => setFormData({ ...formData, suspiciousActivityWindowMinutes: parseInt(e.target.value) || 15 })}
                    disabled={!formData.ipBlockingEnabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Rango: 1-60 minutos
                  </p>
                </div>
              </div>

              {!formData.ipBlockingEnabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Útil para entornos de pruebas</p>
                      <p>
                        Al desactivar el bloqueo de IP, el sistema no bloqueará automáticamente 
                        direcciones IP, lo que facilita las pruebas y el desarrollo. 
                        Se recomienda activarlo en producción.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Security Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rate Limiting */}
            <Card>
              <CardHeader className="border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Rate Limiting</CardTitle>
                      <CardDescription className="text-xs">
                        Limita solicitudes por IP
                      </CardDescription>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rateLimitEnabled}
                      onChange={() => handleToggle('rateLimitEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>
              </CardHeader>
            </Card>

            {/* Abuse Detection */}
            <Card>
              <CardHeader className="border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Detección de Abuso</CardTitle>
                      <CardDescription className="text-xs">
                        Detecta patrones sospechosos
                      </CardDescription>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.abuseDetectionEnabled}
                      onChange={() => handleToggle('abuseDetectionEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>
              </CardHeader>
            </Card>

            {/* Brute Force Protection */}
            <Card>
              <CardHeader className="border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <Lock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Protección Brute Force</CardTitle>
                      <CardDescription className="text-xs">
                        Protege contra ataques de fuerza bruta
                      </CardDescription>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bruteForceProtectionEnabled}
                      onChange={() => handleToggle('bruteForceProtectionEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg">
                  <Info className="h-6 w-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Información Importante
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Los cambios se aplican inmediatamente sin reiniciar el servidor</li>
                    <li>• El bloqueo de IP ayuda a prevenir ataques y abuso del sistema</li>
                    <li>• Se recomienda mantener activado en producción</li>
                    <li>• Puedes desactivarlo temporalmente para pruebas o desarrollo</li>
                    <li>• Los bloqueos existentes se mantienen hasta que expiren</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    </AdminLayout>
  );
}

