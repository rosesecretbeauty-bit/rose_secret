import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Check, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
export function GiftCardPage() {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [design, setDesign] = useState(0);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const addToast = useToastStore(state => state.addToast);
  const addItem = useCartStore(state => state.addItem);
  const designs = ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=1000&auto=format&fit=crop'];
  const handleAddToCart = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount < 10) {
      addToast({
        type: 'error',
        message: 'El monto mínimo es $10'
      });
      return;
    }
    // Mock product for gift card
    const giftCardProduct = {
      id: `gc-${Date.now()}`,
      name: `Tarjeta de Regalo $${finalAmount}`,
      price: finalAmount,
      images: [designs[design]],
      category: 'gift-cards',
      description: `Para: ${recipientName}`,
      stock: 999,
      rating: 5,
      reviews: 0,
      isNew: false,
      isBestSeller: false
    };
    addItem(giftCardProduct, 1);
    addToast({
      type: 'success',
      message: 'Tarjeta de regalo añadida al carrito'
    });
  };
  return <div className="min-h-screen bg-white py-12">
      <div className="container-custom max-w-6xl">
        <div className="text-center mb-12">
          <span className="text-rose-600 font-medium tracking-wider uppercase text-sm mb-3 block">
            El Regalo Perfecto
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tarjetas de Regalo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dales la libertad de elegir su propio lujo. Nuestras tarjetas de
            regalo digitales se envían al instante o en la fecha que elijas.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Configuration */}
          <div className="space-y-8">
            {/* Amount Selection */}
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
                1. Elige el monto
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[25, 50, 100, 200, 500].map(val => <button key={val} onClick={() => {
                setAmount(val);
                setCustomAmount('');
              }} className={`py-3 rounded-lg border-2 font-medium transition-all ${amount === val && !customAmount ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                    ${val}
                  </button>)}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input type="number" placeholder="Otro" value={customAmount} onChange={e => setCustomAmount(e.target.value)} className={`w-full py-3 pl-7 pr-3 rounded-lg border-2 font-medium focus:ring-0 transition-all ${customAmount ? 'border-rose-600 bg-rose-50' : 'border-gray-200'}`} />
                </div>
              </div>
            </div>

            {/* Design Selection */}
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
                2. Elige el diseño
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {designs.map((img, idx) => <button key={idx} onClick={() => setDesign(idx)} className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 transition-all ${design === idx ? 'border-rose-600 ring-2 ring-rose-200' : 'border-transparent hover:opacity-90'}`}>
                    <img src={img} alt="Design" className="w-full h-full object-cover" />
                    {design === idx && <div className="absolute inset-0 bg-rose-900/20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1">
                          <Check className="h-4 w-4 text-rose-600" />
                        </div>
                      </div>}
                  </button>)}
              </div>
            </div>

            {/* Details */}
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
                3. Detalles del envío
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nombre del destinatario" value={recipientName} onChange={e => setRecipientName(e.target.value)} />
                  <Input label="Email del destinatario" type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} />
                </div>
                <Textarea label="Mensaje personal (opcional)" rows={3} value={message} onChange={e => setMessage(e.target.value)} />
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span>Se enviará inmediatamente después de la compra</span>
                </div>
              </div>
            </div>

            <Button size="lg" fullWidth onClick={handleAddToCart}>
              Añadir al Carrito - $
              {(customAmount ? parseFloat(customAmount) : amount).toFixed(2)}
            </Button>
          </div>

          {/* Right: Preview */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-6 text-center">
                Vista Previa
              </h3>

              <motion.div className="relative aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl mb-8" initial={{
              scale: 0.95
            }} animate={{
              scale: 1
            }} key={design}>
                <img src={designs[design]} alt="Gift Card" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-medium opacity-90 mb-1">
                        Tarjeta de Regalo
                      </p>
                      <p className="font-serif text-3xl font-bold">
                        ${customAmount || amount}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-xl font-bold">
                        Rose Secret
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">Para:</span>
                  <span className="font-medium text-gray-900">
                    {recipientName || 'Destinatario'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-500">De:</span>
                  <span className="font-medium text-gray-900">Ti</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-2">Mensaje:</span>
                  <p className="text-gray-900 italic text-sm bg-gray-50 p-3 rounded-lg">
                    "{message || 'Espero que disfrutes este regalo especial...'}
                    "
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}