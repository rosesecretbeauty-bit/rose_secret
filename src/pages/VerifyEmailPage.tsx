import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../stores/toastStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Token de verificación no válido o faltante');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus('loading');
    setMessage('Verificando tu correo electrónico...');

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('¡Tu correo electrónico ha sido verificado exitosamente!');
        addToast({
          type: 'success',
          message: 'Correo verificado correctamente',
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/account');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al verificar el correo electrónico');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('Error de conexión. Por favor, intenta de nuevo más tarde.');
      console.error('Error verificando email:', error);
    }
  };

  const resendVerification = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: searchParams.get('email') }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addToast({
          type: 'success',
          message: 'Email de verificación reenviado. Revisa tu bandeja de entrada.',
        });
      } else {
        addToast({
          type: 'error',
          message: data.message || 'Error al reenviar el email de verificación',
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Error de conexión. Por favor, intenta de nuevo más tarde.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="h-16 w-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            Verificación de Correo
          </h1>
          <p className="text-gray-600">
            Estamos verificando tu correo electrónico
          </p>
        </div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-premium-lg p-8"
        >
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-rose-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-700">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mb-6">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Verificación Exitosa!
                </h2>
                <p className="text-gray-600">{message}</p>
              </div>
              <Button
                onClick={() => navigate('/account')}
                fullWidth
                size="lg"
                className="mt-6"
              >
                Ir a Mi Cuenta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mb-6">
                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Error de Verificación
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
              </div>

              <div className="space-y-3">
                {searchParams.get('email') && (
                  <Button
                    onClick={resendVerification}
                    variant="outline"
                    fullWidth
                  >
                    Reenviar Email de Verificación
                  </Button>
                )}
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  size="lg"
                >
                  Ir a Iniciar Sesión
                </Button>
              </div>
            </motion.div>
          )}

          {status === 'idle' && (
            <div className="text-center py-8">
              <p className="text-gray-600">Preparando verificación...</p>
            </div>
          )}
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

