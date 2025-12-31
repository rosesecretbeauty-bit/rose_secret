import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, ShoppingBag, ArrowRight, ThumbsUp, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/products/ProductCard';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { getProductImage } from '../utils/productUtils';
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: string[]; // Product IDs
  actions?: string[];
};
export function AIShopperPage() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: '¡Hola! Soy Rose, tu asistente personal de compras con IA. ¿En qué puedo ayudarte hoy? Puedo recomendarte el perfume perfecto, ayudarte a encontrar un regalo o asesorarte sobre cuidado de la piel.',
    actions: ['Encontrar un perfume', 'Regalo para ella', 'Rutina de skincare']
  }]);

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const data = await getProducts({ limit: 50 });
        setProducts(data.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    // Simulate AI response delay
    setTimeout(() => {
      let responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: ''
      };
      // Simple keyword matching logic for demo
      const lowerText = text.toLowerCase();
      if (lowerText.includes('perfume') || lowerText.includes('fragancia')) {
        // Get featured/perfume products
        const perfumeProducts = products
          .filter(p => p.is_featured || p.is_bestseller)
          .slice(0, 3)
          .map(p => p.id.toString());
        responseMsg.content = 'Basado en lo que buscas, te recomiendo estas fragancias exclusivas de nuestra colección.';
        responseMsg.products = perfumeProducts.length > 0 ? perfumeProducts : products.slice(0, 3).map(p => p.id.toString());
      } else if (lowerText.includes('regalo')) {
        // Get bestsellers
        const bestsellerProducts = products
          .filter(p => p.is_bestseller)
          .slice(0, 3)
          .map(p => p.id.toString());
        responseMsg.content = '¡Qué buen detalle! Para regalo, nuestros best-sellers nunca fallan.';
        responseMsg.products = bestsellerProducts.length > 0 ? bestsellerProducts : products.slice(0, 3).map(p => p.id.toString());
      } else if (lowerText.includes('piel') || lowerText.includes('crema') || lowerText.includes('skincare')) {
        // Get featured products (can be filtered by category in future)
        const skincareProducts = products
          .filter(p => p.is_featured)
          .slice(0, 3)
          .map(p => p.id.toString());
        responseMsg.content = 'Para el cuidado de la piel, la hidratación es clave.';
        responseMsg.products = skincareProducts.length > 0 ? skincareProducts : products.slice(0, 3).map(p => p.id.toString());
      } else {
        responseMsg.content = 'Entiendo. Cuéntame un poco más sobre tus gustos. ¿Prefieres aromas florales, amaderados o cítricos? ¿O estás buscando algo específico para maquillaje?';
        responseMsg.actions = ['Prefiero florales', 'Busco maquillaje', 'Ver novedades'];
      }
      setMessages(prev => [...prev, responseMsg]);
      setIsTyping(false);
    }, 1500);
  };
  const getProductsByIds = (ids: string[]) => {
    return products.filter(p => ids.includes(p.id.toString()));
  };
  return <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm sticky top-0 z-10">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-gray-900">
                Rose AI Personal Shopper
              </h1>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                En línea
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={() => setMessages([messages[0]])}>
            Reiniciar Chat
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container-custom py-6 overflow-y-auto">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map(msg => <motion.div key={msg.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-rose-100 text-rose-600'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Content */}
              <div className={`max-w-[80%] space-y-4`}>
                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-rose-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>

                {/* Suggested Actions */}
                {msg.actions && <div className="flex flex-wrap gap-2">
                    {msg.actions.map(action => <button key={action} onClick={() => handleSend(action)} className="px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-full text-sm hover:bg-rose-50 transition-colors shadow-sm">
                        {action}
                      </button>)}
                  </div>}

                {/* Product Recommendations */}
                {msg.products && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {getProductsByIds(msg.products).map(product => {
                      const productImage = getProductImage(product.images);
                      return <div key={product.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                          <img src={productImage} alt={product.name} className="w-20 h-20 object-cover rounded-lg bg-gray-50" />
                          <div className="flex flex-col justify-between flex-1">
                            <div>
                              <h4 className="font-serif font-bold text-sm text-gray-900 line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {product.brand || 'Rose Secret'}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-bold text-rose-600">
                                ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                              </span>
                              <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-gray-100 rounded-full hover:bg-rose-100 text-gray-600 hover:text-rose-600 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>;
                    })}
                  </div>}
              </div>
            </motion.div>)}

          {isTyping && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
              animationDelay: '0ms'
            }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
              animationDelay: '150ms'
            }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
              animationDelay: '300ms'
            }} />
              </div>
            </motion.div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 sticky bottom-0">
        <div className="container-custom max-w-4xl">
          <form onSubmit={e => {
          e.preventDefault();
          handleSend();
        }} className="relative flex items-center gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe tu mensaje aquí..." className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all shadow-sm" />
            <button type="submit" disabled={!input.trim() || isTyping} className="absolute right-2 p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-2">
            Rose AI puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>
    </div>;
}