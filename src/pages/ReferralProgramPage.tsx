import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, Copy, Check, ArrowRight, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useToastStore } from '../stores/toastStore';
export function ReferralProgramPage() {
  const [copied, setCopied] = useState(false);
  const addToast = useToastStore(state => state.addToast);
  const referralCode = 'ROSE-MARIA-25';
  const referralLink = `https://rosesecret.com/invite/${referralCode}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Enlace copiado al portapapeles'
    });
    setTimeout(() => setCopied(false), 2000);
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-rose-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }}>
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur text-rose-200 text-sm font-medium mb-6 border border-white/20">
              Programa de Referidos
            </span>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Comparte el Lujo,
              <br />
              Recibe Recompensas
            </h1>
            <p className="text-xl text-rose-100 max-w-2xl mx-auto mb-10">
              Invita a tus amigos a descubrir Rose Secret. Ellos reciben $20 de
              descuento en su primera compra y tú recibes $20 por cada amigo que
              compre.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom -mt-16 relative z-20 pb-20">
        {/* Dashboard Card */}
        <Card className="shadow-premium-xl border-0 mb-12">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">
                  Tu enlace exclusivo
                </h2>
                <p className="text-gray-600 mb-6">
                  Comparte este enlace con tus amigos para empezar a ganar.
                </p>

                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                  <div className="flex-1 px-4 font-mono text-gray-600 truncate">
                    {referralLink}
                  </div>
                  <Button onClick={handleCopy} className="flex-shrink-0">
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" /> Facebook
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" /> WhatsApp
                  </Button>
                </div>
              </div>

              <div className="bg-rose-50 rounded-2xl p-8 border border-rose-100">
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-6">
                  Tus Estadísticas
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">
                      Amigos invitados
                    </p>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Crédito ganado</p>
                    <p className="text-3xl font-bold text-rose-600">$60</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Pendientes</p>
                    <p className="text-3xl font-bold text-gray-900">3</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">
                      Próxima recompensa
                    </p>
                    <p className="text-sm font-bold text-green-600 mt-2 flex items-center">
                      En camino <ArrowRight className="h-3 w-3 ml-1" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-12">
            Cómo funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{
            icon: Share2,
            title: '1. Comparte tu enlace',
            desc: 'Envía tu enlace único a tus amigos por email, redes sociales o mensaje.'
          }, {
            icon: Users,
            title: '2. Amigos compran',
            desc: 'Tus amigos reciben $20 de descuento en su primera compra de +$100.'
          }, {
            icon: Gift,
            title: '3. Ganas recompensas',
            desc: 'Recibes $20 en crédito por cada amigo que complete su compra.'
          }].map((step, i) => <motion.div key={i} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: i * 0.2
          }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>)}
          </div>
        </div>
      </div>
    </div>;
}