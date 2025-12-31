import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, ArrowRight, CheckCircle, AlertCircle, KeyRound, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PhoneInput } from '../components/ui/PhoneInput';
import { useToastStore } from '../stores/toastStore';
import { 
  requestPasswordRecoveryByEmail, 
  requestPasswordRecoveryByPhone,
  verifyRecoveryCode,
  resetPassword
} from '../api/profile';

type Step = 'method' | 'request' | 'verify' | 'reset' | 'success';

export function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addToast = useToastStore(state => state.addToast);
  
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<'email' | 'phone' | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Si hay token en URL, ir directo al paso de reset
  React.useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setStep('reset');
    }
  }, [searchParams]);

  const handleRequestRecovery = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (method === 'email') {
        await requestPasswordRecoveryByEmail(email);
        addToast({
          type: 'success',
          message: 'Código de recuperación enviado a tu correo electrónico'
        });
        setStep('verify');
      } else if (method === 'phone') {
        await requestPasswordRecoveryByPhone(email, phone);
        addToast({
          type: 'success',
          message: 'Código de recuperación enviado a tu teléfono'
        });
        setStep('verify');
      }
    } catch (err: any) {
      setError(err.message || 'Error al solicitar recuperación');
      if (err.message?.includes('no está verificado')) {
        addToast({
          type: 'error',
          message: err.message
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await verifyRecoveryCode({ email, code });
      setResetToken(response.reset_token);
      setStep('reset');
      addToast({
        type: 'success',
        message: 'Código verificado correctamente'
      });
    } catch (err: any) {
      setError(err.message || 'Código inválido o expirado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await resetPassword({
        reset_token: resetToken,
        new_password: newPassword
      });
      
      addToast({
        type: 'success',
        message: 'Contraseña actualizada exitosamente'
      });
      
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 1: Seleccionar método
  if (step === 'method') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-gray-600">
              Elige cómo quieres recuperar tu contraseña
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-premium-lg p-8 space-y-4"
          >
            <button
              onClick={() => {
                setMethod('email');
                setStep('request');
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                  <Mail className="h-6 w-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Por Correo Electrónico</h3>
                  <p className="text-sm text-gray-600">Recibirás un código de 6 dígitos en tu email</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-rose-600 transition-colors" />
              </div>
            </button>

            <button
              onClick={() => {
                setMethod('phone');
                setStep('request');
              }}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Por Teléfono</h3>
                  <p className="text-sm text-gray-600">Recibirás un código de 6 dígitos por SMS</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-rose-600 transition-colors" />
              </div>
            </button>
          </motion.div>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Volver a Iniciar Sesión
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Paso 2: Solicitar código
  if (step === 'request') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-gray-600">
              {method === 'email' 
                ? 'Ingresa tu correo electrónico para recibir un código de recuperación'
                : 'Ingresa tu correo y teléfono para recibir un código de recuperación'}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-premium-lg p-8"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-6"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

               {method === 'phone' && (
                 <div>
                   <label className="block text-sm font-semibold text-gray-900 mb-2">
                     Número de Teléfono
                   </label>
                   <PhoneInput
                     value={phone}
                     onChange={(normalized) => setPhone(normalized)}
                     placeholder="123 456 7890"
                     error={phone && phone.length < 10 ? 'El número debe tener 10 dígitos' : undefined}
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     El teléfono debe estar verificado en tu cuenta. Ingresa solo los 10 dígitos (el sistema agregará +52 automáticamente).
                   </p>
                 </div>
               )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('method')}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleRequestRecovery}
                  isLoading={isLoading}
                  disabled={!email || (method === 'phone' && !phone)}
                  className="flex-1"
                >
                  Enviar Código
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Paso 3: Verificar código
  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
              Verificar Código
            </h1>
            <p className="text-gray-600">
              Ingresa el código de 6 dígitos que enviamos a{' '}
              {method === 'email' ? email : phone}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-premium-lg p-8"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-6"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Código de Verificación
                </label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  El código expira en 15 minutos
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('request')}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  isLoading={isLoading}
                  disabled={code.length !== 6}
                  className="flex-1"
                >
                  Verificar
                </Button>
              </div>

              <button
                onClick={handleRequestRecovery}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium w-full text-center"
              >
                ¿No recibiste el código? Reenviar
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Paso 4: Resetear contraseña
  if (step === 'reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
              Nueva Contraseña
            </h1>
            <p className="text-gray-600">
              Crea una nueva contraseña segura para tu cuenta
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-premium-lg p-8"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 mb-6"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nueva Contraseña
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirmar Contraseña
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
              </div>

              <Button
                onClick={handleResetPassword}
                isLoading={isLoading}
                disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                fullWidth
                size="lg"
              >
                Cambiar Contraseña
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Paso 5: Éxito
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </motion.div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            ¡Contraseña Actualizada!
          </h1>
          <p className="text-gray-600">
            Tu contraseña ha sido cambiada exitosamente
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-premium-lg p-8 text-center"
        >
          <p className="text-gray-600 mb-6">
            Ahora puedes iniciar sesión con tu nueva contraseña
          </p>
          <Button
            onClick={() => navigate('/login')}
            fullWidth
            size="lg"
          >
            Iniciar Sesión
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

