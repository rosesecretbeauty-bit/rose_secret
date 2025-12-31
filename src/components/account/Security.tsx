import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Phone, Lock, CheckCircle2, XCircle, Loader2, Send, KeyRound, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PhoneInput } from '../ui/PhoneInput';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { sendEmailVerification, verifyEmail, changePassword, ChangePasswordPayload, sendPhoneVerification, verifyPhone, VerifyPhonePayload } from '../../api/profile';

export function Security() {
  const { user, updateUser, loadProfile } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  
  const [sendingVerification, setSendingVerification] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [phoneVerification, setPhoneVerification] = useState({
    phone: user?.phone || '',
    code: '',
    sending: false,
    verifying: false,
    step: 'input' as 'input' | 'verify'
  });
  const [passwordForm, setPasswordForm] = useState({
    verification_method: 'email' as 'email' | 'phone',
    verification_code: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordStep, setPasswordStep] = useState<'request' | 'verify' | 'change'>('request');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const handleSendEmailVerification = async () => {
    if (!user) return;
    
    try {
      setSendingVerification(true);
      await sendEmailVerification();
      // Recargar perfil para actualizar el estado de verificación
      await loadProfile();
      addToast({
        type: 'success',
        message: 'Email de verificación enviado. Revisa tu bandeja de entrada.'
      });
    } catch (error: any) {
      // Si el error es que ya está verificado, mostrar mensaje informativo
      if (error.message && error.message.includes('ya está verificado')) {
        addToast({
          type: 'info',
          message: 'Tu correo electrónico ya está verificado.'
        });
        // Recargar perfil para actualizar el estado
        await loadProfile();
      } else {
        addToast({
          type: 'error',
          message: error.message || 'Error al enviar email de verificación'
        });
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const handleRequestVerificationCode = async () => {
    try {
      if (passwordForm.verification_method === 'email') {
        await sendEmailVerification();
        addToast({
          type: 'success',
          message: 'Código de verificación enviado a tu correo electrónico'
        });
      } else {
        if (!user?.phone) {
          addToast({
            type: 'error',
            message: 'No tienes un teléfono registrado. Por favor agrega uno primero.'
          });
          return;
        }
        await sendPhoneVerification(user.phone);
        addToast({
          type: 'success',
          message: 'Código de verificación enviado a tu teléfono'
        });
      }
      setPasswordStep('verify');
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al enviar código de verificación'
      });
    }
  };

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordForm.verification_code) {
      errors.verification_code = 'El código de verificación es requerido';
    } else if (passwordForm.verification_code.length !== 6) {
      errors.verification_code = 'El código debe tener 6 dígitos';
    }

    if (!passwordForm.new_password) {
      errors.new_password = 'La nueva contraseña es requerida';
    } else {
      if (passwordForm.new_password.length < 8) {
        errors.new_password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.new_password)) {
        errors.new_password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
      }
    }

    if (!passwordForm.confirm_password) {
      errors.confirm_password = 'Confirma tu nueva contraseña';
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errors.confirm_password = 'Las contraseñas no coinciden';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendPhoneVerification = async () => {
    if (!phoneVerification.phone || phoneVerification.phone.length < 10) {
      addToast({
        type: 'error',
        message: 'Por favor ingresa un número de teléfono válido'
      });
      return;
    }

    try {
      setPhoneVerification({ ...phoneVerification, sending: true });
      const response = await sendPhoneVerification(phoneVerification.phone);
      
      // Si hay código de debug (modo desarrollo), mostrarlo en un toast especial
      if (response.debug_code) {
        addToast({
          type: 'info',
          message: `Código de verificación (modo desarrollo): ${response.debug_code}`,
          duration: 15000 // Mostrar por 15 segundos
        });
      }
      
      setPhoneVerification({ ...phoneVerification, sending: false, step: 'verify' });
      addToast({
        type: 'success',
        message: response.debug_code 
          ? 'Código generado. Revisa el mensaje anterior para el código.'
          : 'Código de verificación enviado al teléfono'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al enviar código de verificación'
      });
      setPhoneVerification({ ...phoneVerification, sending: false });
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneVerification.code || phoneVerification.code.length !== 6) {
      addToast({
        type: 'error',
        message: 'Por favor ingresa un código de 6 dígitos'
      });
      return;
    }

    try {
      setPhoneVerification({ ...phoneVerification, verifying: true });
      await verifyPhone({
        phone: phoneVerification.phone,
        code: phoneVerification.code
      });
      
      // Recargar perfil para actualizar teléfono
      await loadProfile();
      
      addToast({
        type: 'success',
        message: 'Teléfono verificado exitosamente'
      });
      
      setPhoneVerification({
        phone: user?.phone || '',
        code: '',
        sending: false,
        verifying: false,
        step: 'input'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al verificar teléfono'
      });
      setPhoneVerification({ ...phoneVerification, verifying: false });
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    // Verificar que el usuario tenga al menos un método verificado
    if (!isEmailVerified && !hasPhone) {
      addToast({
        type: 'error',
        message: 'Debes tener al menos un método de contacto verificado (email o teléfono) para cambiar tu contraseña'
      });
      return;
    }

    // Verificar que el método seleccionado esté verificado
    if (passwordForm.verification_method === 'email' && !isEmailVerified) {
      addToast({
        type: 'error',
        message: 'Tu correo electrónico no está verificado. Por favor verifica tu correo primero.'
      });
      return;
    }

    if (passwordForm.verification_method === 'phone' && !hasPhone) {
      addToast({
        type: 'error',
        message: 'No tienes un teléfono verificado. Por favor verifica tu teléfono primero.'
      });
      return;
    }

    try {
      setChangingPassword(true);
      const payload: ChangePasswordPayload = {
        verification_code: passwordForm.verification_code,
        verification_method: passwordForm.verification_method,
        new_password: passwordForm.new_password
      };

      await changePassword(payload);
      
      addToast({
        type: 'success',
        message: 'Contraseña actualizada exitosamente'
      });

      // Limpiar formulario y volver al inicio
      setPasswordForm({
        verification_method: 'email',
        verification_code: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordStep('request');
      setPasswordErrors({});
      
      // Recargar perfil
      await loadProfile();
    } catch (error: any) {
      let errorMessage = 'Error al cambiar contraseña';
      
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
      setChangingPassword(false);
    }
  };

  // Recargar perfil si el usuario cambió
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, []);

  if (!user) {
    return null;
  }

  const isEmailVerified = user.email_verified || false;
  const hasPhone = !!user.phone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Seguridad de la Cuenta
        </h2>
        <p className="text-gray-500">
          Gestiona la seguridad y verificaciones de tu cuenta
        </p>
      </div>

      {/* Alertas de Seguridad */}
      {(!isEmailVerified || !hasPhone) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-amber-900 mb-1">
                Mejora la seguridad de tu cuenta
              </h3>
              <ul className="text-sm text-amber-800 space-y-1">
                {!isEmailVerified && (
                  <li>• Verifica tu correo electrónico para proteger tu cuenta</li>
                )}
                {!hasPhone && (
                  <li>• Agrega un número de teléfono para mayor seguridad</li>
                )}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Verificación de Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isEmailVerified ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <Mail className={`h-5 w-5 ${isEmailVerified ? 'text-green-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-gray-900">
                    Verificación de Correo Electrónico
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isEmailVerified 
                      ? 'Tu correo está verificado y protegido'
                      : 'Verifica tu correo para mayor seguridad'}
                  </p>
                </div>
              </div>
              {isEmailVerified ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              ) : (
                <Badge variant="primary" className="bg-amber-100 text-amber-700 border-amber-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Pendiente
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{user.email}</p>
                  {user.email_verified_at && (
                    <p className="text-sm text-gray-500">
                      Verificado el {new Date(user.email_verified_at).toLocaleDateString('es-LATAM', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>

              {!isEmailVerified && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800">
                        Verifica tu correo electrónico para proteger tu cuenta y acceder a todas las funciones.
                        Revisa tu bandeja de entrada (y la carpeta de spam) para encontrar el email de verificación.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isEmailVerified && (
                <Button
                  onClick={handleSendEmailVerification}
                  disabled={sendingVerification}
                  variant="outline"
                >
                  {sendingVerification ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Reenviar Email de Verificación
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Teléfono */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${hasPhone ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Phone className={`h-5 w-5 ${hasPhone ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-gray-900">
                    Número de Teléfono
                  </h3>
                  <p className="text-sm text-gray-500">
                    {hasPhone 
                      ? 'Tu número de teléfono está registrado'
                      : 'Agrega un número de teléfono para mayor seguridad'}
                  </p>
                </div>
              </div>
              {hasPhone ? (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Registrado
                </Badge>
              ) : (
                <Badge variant="primary" className="bg-gray-100 text-gray-700 border-gray-200">
                  No configurado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hasPhone && phoneVerification.step === 'input' ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                    <p className="text-sm text-gray-500">
                      Puedes editar tu teléfono en la sección de Configuración
                    </p>
                  </div>
                </div>
              ) : !hasPhone && phoneVerification.step === 'input' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 mb-3">
                        Agrega un número de teléfono para recibir notificaciones importantes y mejorar la seguridad de tu cuenta.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Teléfono
                    </label>
                     <div className="flex gap-2">
                       <div className="flex-1">
                         <PhoneInput
                           value={phoneVerification.phone}
                           onChange={(normalized) => setPhoneVerification({ ...phoneVerification, phone: normalized })}
                           placeholder="123 456 7890"
                           error={phoneVerification.phone && phoneVerification.phone.length < 10 ? 'El número debe tener 10 dígitos' : undefined}
                         />
                       </div>
                       <Button
                         onClick={handleSendPhoneVerification}
                         disabled={phoneVerification.sending || !phoneVerification.phone || phoneVerification.phone.length < 10}
                       >
                         {phoneVerification.sending ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (
                           <>
                             <Send className="h-4 w-4 mr-2" />
                             Enviar Código
                           </>
                         )}
                       </Button>
                     </div>
                  </div>
                </div>
              ) : null}

              {phoneVerification.step === 'verify' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 mb-3">
                        Ingresa el código de 6 dígitos que enviamos a {phoneVerification.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de Verificación
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={phoneVerification.code}
                        onChange={(e) => setPhoneVerification({ ...phoneVerification, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <Button
                        onClick={handleVerifyPhone}
                        disabled={phoneVerification.verifying || phoneVerification.code.length !== 6}
                      >
                        {phoneVerification.verifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Verificar'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ¿No recibiste el código?{' '}
                      <button
                        onClick={() => setPhoneVerification({ ...phoneVerification, step: 'input', code: '' })}
                        className="text-rose-600 hover:text-rose-700 font-medium"
                      >
                        Volver
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cambio de Contraseña */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100">
                <Lock className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-gray-900">
                  Cambiar Contraseña
                </h3>
                <p className="text-sm text-gray-500">
                  Actualiza tu contraseña para mantener tu cuenta segura
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Paso 1: Solicitar código de verificación */}
              {passwordStep === 'request' && (
                <>
                  {(!isEmailVerified && !hasPhone) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-amber-800">
                            Para cambiar tu contraseña, necesitas tener al menos un método de contacto verificado (email o teléfono).
                            Por favor verifica tu email o teléfono primero.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Verificación
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isEmailVerified) {
                            addToast({
                              type: 'error',
                              message: 'Tu correo electrónico no está verificado. Por favor verifica tu correo primero.'
                            });
                            return;
                          }
                          setPasswordForm({ ...passwordForm, verification_method: 'email' });
                        }}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          passwordForm.verification_method === 'email'
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!isEmailVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isEmailVerified}
                      >
                        <Mail className={`h-5 w-5 mb-2 ${passwordForm.verification_method === 'email' ? 'text-rose-600' : 'text-gray-400'}`} />
                        <p className="text-sm font-medium text-gray-900">Por Email</p>
                        {!isEmailVerified && (
                          <p className="text-xs text-gray-500 mt-1">No verificado</p>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!hasPhone) {
                            addToast({
                              type: 'error',
                              message: 'No tienes un teléfono verificado. Por favor verifica tu teléfono primero.'
                            });
                            return;
                          }
                          setPasswordForm({ ...passwordForm, verification_method: 'phone' });
                        }}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          passwordForm.verification_method === 'phone'
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!hasPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!hasPhone}
                      >
                        <Phone className={`h-5 w-5 mb-2 ${passwordForm.verification_method === 'phone' ? 'text-rose-600' : 'text-gray-400'}`} />
                        <p className="text-sm font-medium text-gray-900">Por Teléfono</p>
                        {!hasPhone && (
                          <p className="text-xs text-gray-500 mt-1">No configurado</p>
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleRequestVerificationCode}
                    disabled={!isEmailVerified && !hasPhone}
                    fullWidth
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Código de Verificación
                  </Button>
                </>
              )}

              {/* Paso 2: Verificar código */}
              {passwordStep === 'verify' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-800">
                          Ingresa el código de 6 dígitos que enviamos a{' '}
                          {passwordForm.verification_method === 'email' ? user.email : user.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de Verificación
                    </label>
                    <input
                      type="text"
                      value={passwordForm.verification_code}
                      onChange={(e) => {
                        const code = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPasswordForm({ ...passwordForm, verification_code: code });
                        if (passwordErrors.verification_code) {
                          setPasswordErrors({ ...passwordErrors, verification_code: '' });
                        }
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all text-center text-2xl tracking-widest font-mono ${
                        passwordErrors.verification_code ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="000000"
                      maxLength={6}
                    />
                    {passwordErrors.verification_code && (
                      <p className="text-sm text-red-600 mt-1">{passwordErrors.verification_code}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPasswordStep('request');
                        setPasswordForm({ ...passwordForm, verification_code: '' });
                      }}
                      className="flex-1"
                    >
                      Volver
                    </Button>
                    <Button
                      onClick={() => {
                        if (passwordForm.verification_code.length === 6) {
                          setPasswordStep('change');
                        } else {
                          setPasswordErrors({ verification_code: 'El código debe tener 6 dígitos' });
                        }
                      }}
                      disabled={passwordForm.verification_code.length !== 6}
                      className="flex-1"
                    >
                      Continuar
                    </Button>
                  </div>

                  <button
                    onClick={handleRequestVerificationCode}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium w-full text-center"
                  >
                    ¿No recibiste el código? Reenviar
                  </button>
                </>
              )}

              {/* Paso 3: Cambiar contraseña */}
              {passwordStep === 'change' && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800">
                        Código verificado. Ahora ingresa tu nueva contraseña.
                      </p>
                    </div>
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, new_password: e.target.value });
                    if (passwordErrors.new_password) {
                      setPasswordErrors({ ...passwordErrors, new_password: '' });
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all ${
                    passwordErrors.new_password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Mínimo 8 caracteres, con mayúscula, minúscula y número"
                />
                {passwordErrors.new_password && (
                  <p className="text-sm text-red-600 mt-1">{passwordErrors.new_password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value });
                    if (passwordErrors.confirm_password) {
                      setPasswordErrors({ ...passwordErrors, confirm_password: '' });
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all ${
                    passwordErrors.confirm_password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Confirma tu nueva contraseña"
                />
                {passwordErrors.confirm_password && (
                  <p className="text-sm text-red-600 mt-1">{passwordErrors.confirm_password}</p>
                )}
              </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPasswordStep('verify');
                        setPasswordForm({ ...passwordForm, new_password: '', confirm_password: '' });
                      }}
                      className="flex-1"
                    >
                      Volver
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={changingPassword || !passwordForm.new_password || !passwordForm.confirm_password}
                      className="flex-1"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Cambiar Contraseña
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

