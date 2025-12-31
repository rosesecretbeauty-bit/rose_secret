import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';
export function BackInStockAlertsPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  return <div className="bg-gray-50 min-h-screen py-20">
      <div className="container-custom max-w-2xl">
        <GlassCard className="p-8 md:p-12 text-center">
          <motion.div initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
            {submitted ? <CheckCircle className="h-10 w-10 text-green-500" /> : <Bell className="h-10 w-10 text-rose-600" />}
          </motion.div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {submitted ? "You're on the list!" : 'Never Miss Out Again'}
          </h1>

          <p className="text-gray-600 mb-8 text-lg">
            {submitted ? "We'll notify you as soon as your favorite items are back in stock. Keep an eye on your inbox." : 'Sign up to receive instant notifications when our most popular out-of-stock items become available again.'}
          </p>

          {!submitted && <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" required placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all" />
              </div>
              <Button type="submit" size="lg" fullWidth>
                Notify Me
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                By signing up, you agree to receive marketing emails from Rose
                Secret. You can unsubscribe at any time.
              </p>
            </form>}

          {submitted && <Button variant="outline" onClick={() => window.location.href = '/shop'}>
              Continue Shopping
            </Button>}
        </GlassCard>
      </div>
    </div>;
}