import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
interface ImageZoomProps {
  images: string[];
  currentIndex: number;
  productName: string;
  onIndexChange: (index: number) => void;
}
export function ImageZoom({
  images = [],
  currentIndex = 0,
  productName = '',
  onIndexChange
}: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50
  });
  const imageRef = useRef<HTMLDivElement>(null);
  // Safety check: return early if no images
  if (!images || images.length === 0) {
    return <div className="relative aspect-square rounded-2xl bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>;
  }
  // Ensure currentIndex is valid
  const safeCurrentIndex = Math.max(0, Math.min(currentIndex, images.length - 1));
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    setZoomPosition({
      x,
      y
    });
  };
  const nextImage = () => {
    if (!onIndexChange || images.length === 0) return;
    onIndexChange((safeCurrentIndex + 1) % images.length);
  };
  const prevImage = () => {
    if (!onIndexChange || images.length === 0) return;
    onIndexChange((safeCurrentIndex - 1 + images.length) % images.length);
  };
  return <>
      {/* Main Image with Zoom */}
      <div ref={imageRef} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in group" onMouseEnter={() => setIsZoomed(true)} onMouseLeave={() => setIsZoomed(false)} onMouseMove={handleMouseMove} onClick={() => setIsLightboxOpen(true)}>
        <img src={images[safeCurrentIndex]} alt={productName} className="w-full h-full object-cover transition-transform duration-300" style={{
        transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
      }} />

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-5 w-5 text-gray-700" />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && <>
            <button onClick={e => {
          e.stopPropagation();
          prevImage();
        }} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110">
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button onClick={e => {
          e.stopPropagation();
          nextImage();
        }} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110">
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>}

        {/* Image counter */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
          {safeCurrentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setIsLightboxOpen(false)}>
            {/* Close button */}
            <button onClick={() => setIsLightboxOpen(false)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Navigation */}
            {images.length > 1 && <>
                <button onClick={e => {
            e.stopPropagation();
            prevImage();
          }} className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <ChevronLeft className="h-8 w-8 text-white" />
                </button>
                <button onClick={e => {
            e.stopPropagation();
            nextImage();
          }} className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <ChevronRight className="h-8 w-8 text-white" />
                </button>
              </>}

            {/* Main image */}
            <motion.img key={safeCurrentIndex} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.9
        }} src={images[safeCurrentIndex]} alt={productName} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />

            {/* Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, idx) => <button key={idx} onClick={e => {
            e.stopPropagation();
            if (onIndexChange) {
              onIndexChange(idx);
            }
          }} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === safeCurrentIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>)}
            </div>
          </motion.div>}
      </AnimatePresence>
    </>;
}