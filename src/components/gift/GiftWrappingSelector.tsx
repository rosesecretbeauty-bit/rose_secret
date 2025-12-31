import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Check } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
interface GiftWrappingProps {
  onSelect: (option: {
    type: string;
    price: number;
    message: string;
  } | null) => void;
}
export function GiftWrappingSelector({
  onSelect
}: GiftWrappingProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [message, setMessage] = useState('');
  const styles = [{
    id: 'classic',
    name: 'Classic Rose',
    price: 5,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200'
  }, {
    id: 'premium',
    name: 'Gold Elegance',
    price: 10,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=200'
  }, {
    id: 'luxury',
    name: 'Velvet Box',
    price: 15,
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=200'
  }];
  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      onSelect(null);
    } else {
      updateSelection(selectedStyle, message);
    }
  };
  const updateSelection = (styleId: string, msg: string) => {
    const style = styles.find(s => s.id === styleId);
    if (style) {
      onSelect({
        type: style.name,
        price: style.price,
        message: msg
      });
    }
  };
  return <Card className="overflow-hidden border-rose-100">
      <div className="bg-rose-50/50 p-4 flex items-center gap-3 border-b border-rose-100">
        <div className="p-2 bg-white rounded-full shadow-sm text-rose-600">
          <Gift className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">Add Gift Wrapping</h3>
          <p className="text-xs text-gray-500">
            Make it special with our premium packaging
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={e => handleToggle(e.target.checked)} />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
        </label>
      </div>

      <AnimatePresence>
        {isEnabled && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} className="overflow-hidden">
            <CardContent className="p-4 space-y-6">
              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Wrapping Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {styles.map(style => <div key={style.id} onClick={() => {
                setSelectedStyle(style.id);
                updateSelection(style.id, message);
              }} className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedStyle === style.id ? 'border-rose-600 ring-2 ring-rose-100' : 'border-transparent hover:border-gray-200'}`}>
                      <img src={style.image} alt={style.name} className="w-full h-20 object-cover" />
                      <div className="p-2 text-center bg-white">
                        <p className="text-xs font-bold text-gray-900">
                          {style.name}
                        </p>
                        <p className="text-xs text-rose-600">+${style.price}</p>
                      </div>
                      {selectedStyle === style.id && <div className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5">
                          <Check className="h-3 w-3" />
                        </div>}
                    </div>)}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gift Message (Optional)
                </label>
                <textarea value={message} onChange={e => {
              setMessage(e.target.value);
              updateSelection(selectedStyle, e.target.value);
            }} maxLength={200} placeholder="Write a personal note..." className="w-full rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500 text-sm p-3 h-24 resize-none" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    Printed on a premium card
                  </span>
                  <span className="text-xs text-gray-400">
                    {message.length}/200
                  </span>
                </div>
              </div>
            </CardContent>
          </motion.div>}
      </AnimatePresence>
    </Card>;
}