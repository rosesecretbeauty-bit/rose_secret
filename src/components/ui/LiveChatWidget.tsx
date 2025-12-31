import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Paperclip, Smile } from 'lucide-react';
import { Button } from './Button';
interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}
export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    sender: 'agent',
    text: '¡Hola! Bienvenido a Rose Secret. ¿En qué puedo ayudarte hoy?',
    timestamp: new Date()
  }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [messages, isOpen, isMinimized]);
  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);
    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: 'Gracias por tu mensaje. Un asesor de belleza se pondrá en contacto contigo en breve.',
        timestamp: new Date()
      }]);
    }, 2000);
  };
  const quickReplies = ['¿Dónde está mi pedido?', 'Política de devoluciones', 'Ayuda con un producto', 'Hablar con un humano'];
  return <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && <motion.div initial={{
        opacity: 0,
        y: 20,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: 20,
        scale: 0.95
      }} className="bg-white rounded-2xl shadow-2xl w-[350px] sm:w-[380px] h-[500px] flex flex-col overflow-hidden border border-gray-100 mb-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-rose-500 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-rose-600 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Soporte Rose Secret</h3>
                  <p className="text-xs text-rose-100">En línea ahora</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              <div className="text-center text-xs text-gray-400 my-4">
                <span>
                  Hoy,{' '}
                  {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
                </span>
              </div>

              {messages.map(msg => <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-rose-600 text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'}`}>
                    {msg.text}
                    <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-rose-200' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                    </div>
                  </div>
                </div>)}

              {isTyping && <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: '0ms'
              }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: '150ms'
              }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: '300ms'
              }}></span>
                  </div>
                </div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length < 3 && <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
                {quickReplies.map((reply, i) => <button key={i} onClick={() => {
            setInputValue(reply);
            handleSendMessage();
          }} className="whitespace-nowrap text-xs bg-white border border-rose-200 text-rose-700 px-3 py-1.5 rounded-full hover:bg-rose-50 transition-colors shadow-sm">
                    {reply}
                  </button>)}
              </div>}

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button type="button" className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all" />
                <button type="submit" disabled={!inputValue.trim()} className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button whileHover={{
      scale: 1.05
    }} whileTap={{
      scale: 0.95
    }} onClick={() => {
      setIsOpen(!isOpen);
      setIsMinimized(false);
    }} className="relative w-14 h-14 bg-rose-600 text-white rounded-full shadow-lg shadow-rose-600/30 flex items-center justify-center hover:bg-rose-700 transition-colors z-50">
        <AnimatePresence mode="wait">
          {isOpen && !isMinimized ? <motion.div key="close" initial={{
          rotate: -90,
          opacity: 0
        }} animate={{
          rotate: 0,
          opacity: 1
        }} exit={{
          rotate: 90,
          opacity: 0
        }}>
              <X className="h-6 w-6" />
            </motion.div> : <motion.div key="chat" initial={{
          rotate: 90,
          opacity: 0
        }} animate={{
          rotate: 0,
          opacity: 1
        }} exit={{
          rotate: -90,
          opacity: 0
        }}>
              <MessageCircle className="h-7 w-7" />
            </motion.div>}
        </AnimatePresence>

        {/* Unread Badge */}
        {!isOpen && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold">
            1
          </span>}
      </motion.button>
    </div>;
}