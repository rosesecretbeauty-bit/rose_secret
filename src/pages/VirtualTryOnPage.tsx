import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCw, Share2, ShoppingBag, X, Sliders } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getProducts } from '../api/products';
import { Product } from '../types';
import { PremiumLoader } from '../components/ui/PremiumLoader';
import { getProductImage } from '../utils/productUtils';

export function VirtualTryOnPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [intensity, setIntensity] = useState(80);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        const data = await getProducts({ limit: 6 });
        setProducts(data.products);
        if (data.products.length > 0) {
          setActiveProduct(data.products[0]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error('Error accessing camera', err);
      let errorMessage = 'No se pudo acceder a la cámara.';
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No se encontró ninguna cámara en tu dispositivo.';
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación.';
      }
      setCameraError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  if (isLoading || !activeProduct) {
    return <div className="min-h-screen flex items-center justify-center bg-black">
      <PremiumLoader />
    </div>;
  }
  return <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Camera View */}
      <div className="relative flex-1 bg-gray-900 overflow-hidden flex items-center justify-center">
        {!cameraActive ? <div className="text-center p-8 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="h-10 w-10 text-gray-400" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-4">
              Virtual Try-On
            </h1>
            <p className="text-gray-400 mb-8">
              See how our products look on you in real-time using advanced AR
              technology.
            </p>
            {cameraError && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p className="text-red-300 text-sm">{cameraError}</p>
              </div>
            )}
            <Button size="lg" onClick={startCamera} className="bg-white text-black hover:bg-gray-200">
              Enable Camera
            </Button>
            {cameraError && (
              <p className="text-xs text-gray-500 mt-4">
                Nota: Esta función requiere una cámara web. Si no tienes una cámara, puedes seguir navegando los productos a continuación.
              </p>
            )}
          </div> : <div className="relative w-full h-full">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />

            {/* AR Overlay Mock */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="border-2 border-white/20 w-64 h-80 rounded-[50%] opacity-50" />
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6">
              <div className="bg-black/60 backdrop-blur rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Intensity
                  </span>
                  <span className="text-xs">{intensity}%</span>
                </div>
                <input type="range" min="0" max="100" value={intensity} onChange={e => setIntensity(parseInt(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-rose-500" />
              </div>
            </div>
          </div>}
      </div>

      {/* Sidebar Controls */}
      <div className="w-full md:w-96 bg-white text-gray-900 flex flex-col h-[40vh] md:h-screen">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold">Select Shade</h2>
          <Button variant="ghost" size="sm" onClick={stopCamera}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {products.map(product => {
              const productImage = getProductImage(product.images);
              const productPrice = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price?.toString() || '0').toFixed(2);
              return <button key={product.id} onClick={() => setActiveProduct(product)} className={`text-left p-3 rounded-xl border transition-all ${activeProduct.id === product.id ? 'border-rose-600 bg-rose-50 ring-1 ring-rose-600' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100">
                    <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-medium text-sm line-clamp-1">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">${productPrice}</p>
                </button>;
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-4 mb-4">
            <img src={getProductImage(activeProduct.images)} alt={activeProduct.name} className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-200" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {activeProduct.name}
              </p>
              <p className="text-rose-600 font-bold">${typeof activeProduct.price === 'number' ? activeProduct.price.toFixed(2) : parseFloat(activeProduct.price?.toString() || '0').toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button fullWidth className="flex-1">
              <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
            <Button variant="outline" className="px-3">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
}