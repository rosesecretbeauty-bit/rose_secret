import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, PenTool, Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
interface GiftOptionsProps {
  onSave: (options: any) => void;
}
export function GiftOptions({
  onSave
}: GiftOptionsProps) {
  const [isGift, setIsGift] = useState(false);
  const [wrapStyle, setWrapStyle] = useState('classic');
  const [message, setMessage] = useState('');
  const wrapStyles = [{
    id: 'classic',
    name: 'Classic Rose',
    price: 5,
    color: 'bg-rose-100'
  }, {
    id: 'luxury',
    name: 'Luxury Gold',
    price: 8,
    color: 'bg-yellow-100'
  }, {
    id: 'minimal',
    name: 'Minimalist White',
    price: 5,
    color: 'bg-gray-100'
  }];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg">
            <Gift className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Add Gift Wrapping</h3>
            <p className="text-sm text-gray-500">
              Make it special with premium packaging
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
        </label>
      </div>

      <AnimatePresence>
        {isGift && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} className="overflow-hidden">
            <div className="pt-4 border-t border-gray-100 space-y-6">
              {/* Wrap Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Wrapping Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {wrapStyles.map(style => <button key={style.id} onClick={() => setWrapStyle(style.id)} className={`relative p-3 rounded-xl border-2 transition-all text-left ${wrapStyle === style.id ? 'border-rose-600 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className={`h-12 w-full rounded-lg mb-2 ${style.color}`} />
                      <div className="font-medium text-sm text-gray-900">
                        {style.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        +${style.price}
                      </div>
                      {wrapStyle === style.id && <div className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>}
                    </button>)}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gift Message (Optional)
                </label>
                <div className="relative">
                  <textarea value={message} onChange={e => setMessage(e.target.value)} maxLength={200} rows={4} className="w-full rounded-xl border-gray-200 focus:ring-rose-500 focus:border-rose-500 p-4 font-serif italic bg-gray-50" placeholder="Write a personal note..." />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {message.length}/200
                  </div>
                </div>
              </div>

              <Button fullWidth onClick={() => onSave({
            isGift,
            wrapStyle,
            message
          })}>
                Save Gift Options
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}