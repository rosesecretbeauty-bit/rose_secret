import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ForgotPasswordPage - Redirige a la nueva página de recuperación de contraseña
 * Mantenido para compatibilidad con enlaces antiguos
 */
export function ForgotPasswordPage() {
  // Redirigir a la nueva página de recuperación
  return <Navigate to="/password-recovery" replace />;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const addToast = useToastStore(state => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        addToast({
          type: 'success',
          message: 'Email de recuperación enviado. Revisa tu bandeja de entrada.',
        });
      } else {
        setError(data.message || 'Error al enviar el email de recuperación');
      }
    } catch (err: any) {
      setError('Error de conexión. Por favor, intenta de nuevo más tarde.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
              Email Enviado
            </h1>
            <p className="text-gray-600">
              Revisa tu bandeja de entrada
            </p>
          </div>

          {/* Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-premium-lg p-8 text-center"
          >
            <div className="mb-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Revisa tu Correo!
              </h2>
              <p className="text-gray-600 mb-2">
                Hemos enviado un enlace de recuperación a:
              </p>
              <p className="font-semibold text-gray-900 mb-4">{email}</p>
              <p className="text-sm text-gray-600">
                Haz clic en el enlace del email para restablecer tu contraseña.
                El enlace expirará en 1 hora.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                fullWidth
                size="lg"
              >
                Volver a Iniciar Sesión
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                fullWidth
              >
                Enviar a otro Email
              </Button>
            </div>
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
            ¿Olvidaste tu Contraseña?
          </h1>
          <p className="text-gray-600">
            No te preocupes, te enviaremos un enlace para restablecerla
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-premium-lg p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
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
              <p className="text-sm text-gray-500 mt-2">
                Ingresa el email asociado a tu cuenta y te enviaremos un enlace
                para restablecer tu contraseña.
              </p>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Enviar Enlace de Recuperación
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Recordaste tu contraseña?{' '}
              <Link
                to="/login"
                className="font-medium text-rose-600 hover:text-rose-700"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
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

