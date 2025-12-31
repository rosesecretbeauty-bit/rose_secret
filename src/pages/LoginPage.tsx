import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore(state => state.login);
  const addToast = useToastStore(state => state.addToast);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Si llegamos aquí, el login fue exitoso
      addToast({
        type: 'success',
        message: '¡Bienvenida de vuelta!'
      });
      navigate('/');
    } catch (err: any) {
      // Mostrar el mensaje de error específico del backend
      const errorMessage = err?.message || 'Email o contraseña incorrectos';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne/20 flex items-center justify-center py-12 px-4">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} transition={{
          type: 'spring',
          delay: 0.2
        }} className="inline-block mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
              <span className="text-white font-serif font-bold text-2xl">
                RS
              </span>
            </div>
          </motion.div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            Bienvenida de vuelta
          </h1>
          <p className="text-gray-600">
            Inicia sesión para continuar tu experiencia
          </p>
        </div>

        {/* Demo Credentials Info */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }} className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-purple-900 mb-1">
                Credenciales de prueba:
              </p>
              <p className="text-purple-700">
                <span className="font-medium">Admin:</span> admin@rosesecret.com
                / admin123
              </p>
              <p className="text-purple-700">
                <span className="font-medium">Cliente:</span> maria@example.com
                / password123
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4
      }} className="bg-white rounded-2xl shadow-premium-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="pl-10" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                <span className="ml-2 text-sm text-gray-600">Recordarme</span>
              </label>
              <Link to="/password-recovery" className="text-sm font-medium text-rose-600 hover:text-rose-700">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Iniciar Sesión
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium text-rose-600 hover:text-rose-700">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.5
      }} className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Volver al inicio
          </Link>
        </motion.div>
      </motion.div>
    </div>;
}