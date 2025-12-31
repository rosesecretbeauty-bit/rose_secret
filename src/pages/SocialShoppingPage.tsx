import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, MessageSquare, ShoppingBag, ThumbsUp, ThumbsDown, Send, Crown, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ProductCard } from '../components/products/ProductCard';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { useToastStore } from '../stores/toastStore';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { getProductImage } from '../utils/productUtils';

// Mock types for social shopping
type User = {
  id: string;
  name: string;
  avatar: string;
  isHost?: boolean;
};
type ChatMessage = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
};

export function SocialShoppingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const addToast = useToastStore(state => state.addToast);
  
  // Users in room - Dynamic based on current user (when real-time features are implemented)
  const [users] = useState<User[]>([]);
  
  // Get current user info dynamically when userName is available
  const currentUser = userName ? {
    id: 'current-user',
    name: userName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
    isHost: true
  } : null;
  const createRoom = () => {
    if (!userName) {
      addToast({
        type: 'error',
        message: 'Por favor ingresa tu nombre'
      });
      return;
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setIsInRoom(true);
    addToast({
      type: 'success',
      message: `Sala creada: ${code}`
    });
  };
  const joinRoom = () => {
    if (!userName || !roomCode) {
      addToast({
        type: 'error',
        message: 'Ingresa nombre y código'
      });
      return;
    }
    setIsInRoom(true);
    addToast({
      type: 'success',
      message: 'Te has unido a la sala'
    });
  };
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: userName || 'Tú',
      text: chatMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setMessages([...messages, newMessage]);
    setChatMessage('');
    // Nota: En producción, esto debería enviarse a un servidor de mensajería en tiempo real
  };
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    addToast({
      type: 'success',
      message: 'Código copiado'
    });
  };
  if (isLoadingProducts || !activeProduct) {
    return <div className="min-h-screen flex items-center justify-center">
      <PremiumLoader />
    </div>;
  }

  if (!isInRoom) {
    return <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} className="bg-white p-8 rounded-2xl shadow-premium max-w-md w-full text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            Shopping Party
          </h1>
          <p className="text-gray-600 mb-8">
            Compra con tus amigos en tiempo real, chatea y voten por sus
            productos favoritos.
          </p>

          <div className="space-y-4">
            <Input placeholder="Tu nombre" value={userName} onChange={e => setUserName(e.target.value)} className="text-center" />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Crear o Unirse
                </span>
              </div>
            </div>

            <Button fullWidth onClick={createRoom}>
              Crear Nueva Sala
            </Button>

            <div className="flex gap-2">
              <Input placeholder="Código de sala" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} className="text-center uppercase tracking-widest" />
              <Button variant="outline" onClick={joinRoom}>
                Unirse
              </Button>
            </div>
          </div>
        </motion.div>
      </div>;
  }
  return <div className="h-[calc(100vh-80px)] bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Users & Chat */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 h-full md:h-auto">
        {/* Room Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-900">Sala: {roomCode}</h2>
            <button onClick={copyCode} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex -space-x-2 overflow-hidden py-2">
            {currentUser && (
              <div key={currentUser.id} className="relative group cursor-pointer">
                <img src={currentUser.avatar} alt={currentUser.name} className="inline-block h-10 w-10 rounded-full ring-2 ring-white" />
                {currentUser.isHost && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {currentUser.name}
                </div>
              </div>
            )}
            {users.map(user => (
              <div key={user.id} className="relative group cursor-pointer">
                <img src={user.avatar} alt={user.name} className="inline-block h-10 w-10 rounded-full ring-2 ring-white" />
                {user.isHost && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {user.name}
                </div>
              </div>
            ))}
            <button 
              className="h-10 w-10 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              onClick={() => addToast({ type: 'info', message: 'Funcionalidad de invitar usuarios próximamente' })}
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-xs text-gray-400 my-4">
            La sesión ha comenzado
          </div>
          {messages.map(msg => <div key={msg.id} className={`flex flex-col ${msg.userId === '1' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-600">
                  {msg.userName}
                </span>
                <span className="text-[10px] text-gray-400">
                  {msg.timestamp}
                </span>
              </div>
              <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${msg.userId === '1' ? 'bg-rose-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>)}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-100">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input placeholder="Escribe un mensaje..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} className="flex-1" />
            <Button type="submit" size="icon" disabled={!chatMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Main Content - Product View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              Viendo ahora:
            </span>
            <Badge variant="secondary" className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {activeProduct.name}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" leftIcon={<ThumbsDown className="w-4 h-4" />}>
              No me gusta
            </Button>
            <Button variant="primary" size="sm" leftIcon={<ThumbsUp className="w-4 h-4" />}>
              ¡Me encanta!
            </Button>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setIsInRoom(false)}>
              <LogOut className="w-4 h-4 mr-2" /> Salir
            </Button>
          </div>
        </div>

        {/* Product Display */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
              <motion.div layoutId={`product-image-${activeProduct.id}`} className="aspect-[4/5] rounded-2xl overflow-hidden shadow-premium relative">
                <img src={getProductImage(activeProduct.images)} alt={activeProduct.name} className="w-full h-full object-cover" />

                {/* Live cursors - se mostrarán cuando haya otros usuarios conectados */}
              </motion.div>

              <div>
                {activeProduct.category && <Badge className="mb-4">{activeProduct.category}</Badge>}
                <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
                  {activeProduct.name}
                </h1>
                {activeProduct.description && <p className="text-xl text-gray-600 mb-6">
                  {activeProduct.description}
                </p>}
                <div className="text-3xl font-bold text-rose-600 mb-8">
                  ${typeof activeProduct.price === 'number' ? activeProduct.price.toFixed(2) : parseFloat(activeProduct.price?.toString() || '0').toFixed(2)}
                </div>

                {messages.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-xl mb-8">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> Mensajes del grupo
                    </h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {messages.slice(-3).map((msg) => (
                        <div key={msg.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-200 dark:bg-rose-800 flex items-center justify-center text-xs font-bold text-rose-700 dark:text-rose-300">
                            {msg.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm shadow-sm">
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button size="lg" fullWidth leftIcon={<ShoppingBag className="w-5 h-5" />}>
                  Añadir al Carrito Grupal
                </Button>
              </div>
            </div>

            {/* Suggestions Carousel */}
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-6">
              Explorar Juntos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {products.slice(0, 4).map(product => <div key={product.id} onClick={() => setActiveProduct(product)} className={`cursor-pointer transition-all ${activeProduct?.id === product.id ? 'ring-2 ring-rose-500 rounded-xl' : 'opacity-70 hover:opacity-100'}`}>
                  <ProductCard product={product} />
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
}