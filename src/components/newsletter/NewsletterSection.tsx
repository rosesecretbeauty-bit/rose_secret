import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../stores/toastStore';
export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore(state => state.addToast);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    addToast({
      type: 'success',
      message: 'Thank you for subscribing! Check your email for a welcome gift.'
    });
    setEmail('');
    setIsLoading(false);
  };
  return;
}