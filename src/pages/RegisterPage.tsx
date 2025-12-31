import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register: registerUser
  } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors
    }
  } = useForm<RegisterForm>();
  const password = watch('password');
  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      addToast({
        type: 'success',
        message: 'Welcome to Rose Secret! Enjoy 15% off your first order.'
      });
      navigate('/account');
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center p-4">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <div className="text-3xl font-serif font-bold tracking-tighter text-rose-900">
                ROSE <span className="text-rose-600">SECRET</span>
              </div>
            </Link>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="Jane Doe" {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            }
          })} error={errors.name?.message} />

            <Input label="Email Address" type="email" placeholder="you@example.com" {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })} error={errors.email?.message} />

            <Input label="Password" type="password" placeholder="••••••••" {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })} error={errors.password?.message} />

            <Input label="Confirm Password" type="password" placeholder="••••••••" {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })} error={errors.confirmPassword?.message} />

            <div className="flex items-start">
              <input type="checkbox" required className="mt-1 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-rose-600 hover:text-rose-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-rose-600 hover:text-rose-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-rose-600 hover:text-rose-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.2
      }} className="mt-8 text-center space-y-2">
          <p className="text-sm text-gray-600 font-medium">Join and enjoy:</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <span>✓ 15% off first order</span>
            <span>✓ Exclusive access</span>
            <span>✓ Early sales</span>
            <span>✓ Birthday gifts</span>
          </div>
        </motion.div>
      </motion.div>
    </div>;
}