import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Mail, Lock, Globe, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
interface ShareWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistId?: string;
}
export function ShareWishlistModal({
  isOpen,
  onClose,
  wishlistId = 'my-wishlist'
}: ShareWishlistModalProps) {
  const [privacy, setPrivacy] = useState<'public' | 'private'>('private');
  const [copied, setCopied] = useState(false);
  const shareLink = `https://rosesecret.com/wishlist/shared/${wishlistId}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="h-6 w-6 text-rose-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Share Your Wishlist
          </h2>
          <p className="text-gray-500 text-sm">
            Let friends and family know what you love.
          </p>
        </div>

        <div className="space-y-6">
          {/* Privacy Settings */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Privacy Settings
            </h3>
            <div className="flex gap-4">
              <button onClick={() => setPrivacy('private')} className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${privacy === 'private' ? 'border-rose-600 bg-white shadow-sm' : 'border-transparent hover:bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Lock className={`h-4 w-4 ${privacy === 'private' ? 'text-rose-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${privacy === 'private' ? 'text-rose-900' : 'text-gray-600'}`}>
                    Private
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Only you can see this list.
                </p>
              </button>

              <button onClick={() => setPrivacy('public')} className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${privacy === 'public' ? 'border-rose-600 bg-white shadow-sm' : 'border-transparent hover:bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className={`h-4 w-4 ${privacy === 'public' ? 'text-rose-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${privacy === 'public' ? 'text-rose-900' : 'text-gray-600'}`}>
                    Public
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Anyone with the link can view.
                </p>
              </button>
            </div>
          </div>

          {/* Share Link */}
          <AnimatePresence>
            {privacy === 'public' && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} className="overflow-hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input type="text" readOnly value={shareLink} className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600" />
                  </div>
                  <Button onClick={handleCopy} variant="outline" className="min-w-[100px]">
                    {copied ? <>
                        <Check className="h-4 w-4 mr-2" /> Copied
                      </> : <>
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </>}
                  </Button>
                </div>

                <div className="mt-4 flex gap-2 justify-center">
                  <button className="p-2 bg-[#1877F2] text-white rounded-full hover:opacity-90 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-[#1DA1F2] text-white rounded-full hover:opacity-90 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-[#E4405F] text-white rounded-full hover:opacity-90 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.36-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-gray-600 text-white rounded-full hover:opacity-90 transition-opacity">
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </Modal>;
}