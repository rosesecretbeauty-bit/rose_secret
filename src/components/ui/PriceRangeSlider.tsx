import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
}
export function PriceRangeSlider({
  min = 0,
  max = 1000,
  step = 1,
  value,
  onChange,
  formatLabel = val => `$${val}`
}: PriceRangeSliderProps) {
  // Ensure value is always a valid tuple with fallback
  const safeValue: [number, number] = value && Array.isArray(value) && value.length === 2 ? value : [min, max];
  const [localValue, setLocalValue] = useState<[number, number]>(safeValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<'min' | 'max' | null>(null);
  useEffect(() => {
    if (value && Array.isArray(value) && value.length === 2) {
      setLocalValue(value);
    }
  }, [value]);
  const getPercentage = (val: number) => (val - min) / (max - min) * 100;
  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    isDragging.current = type;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const rawValue = min + percentage * (max - min);
    const newValue = Math.round(rawValue / step) * step;
    setLocalValue(prev => {
      if (isDragging.current === 'min') {
        const nextMin = Math.min(newValue, prev[1] - step);
        return [nextMin, prev[1]];
      } else {
        const nextMax = Math.max(newValue, prev[0] + step);
        return [prev[0], nextMax];
      }
    });
  };
  const handleMouseUp = () => {
    isDragging.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    if (onChange) {
      onChange(localValue);
    }
  };
  return <div className="py-4">
      <div className="relative h-6 mb-2" ref={sliderRef}>
        {/* Track Background */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full -translate-y-1/2" />

        {/* Active Track */}
        <div className="absolute top-1/2 h-1.5 bg-rose-500 rounded-full -translate-y-1/2" style={{
        left: `${getPercentage(localValue[0])}%`,
        right: `${100 - getPercentage(localValue[1])}%`
      }} />

        {/* Min Thumb */}
        <motion.div className="absolute top-1/2 w-5 h-5 bg-white border-2 border-rose-500 rounded-full -translate-y-1/2 shadow-md cursor-grab active:cursor-grabbing z-10" style={{
        left: `${getPercentage(localValue[0])}%`,
        x: '-50%'
      }} onMouseDown={handleMouseDown('min')} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 1.2
      }} />

        {/* Max Thumb */}
        <motion.div className="absolute top-1/2 w-5 h-5 bg-white border-2 border-rose-500 rounded-full -translate-y-1/2 shadow-md cursor-grab active:cursor-grabbing z-10" style={{
        left: `${getPercentage(localValue[1])}%`,
        x: '-50%'
      }} onMouseDown={handleMouseDown('max')} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 1.2
      }} />
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-700">
        <div className="px-3 py-1 bg-gray-100 rounded-md border border-gray-200">
          {formatLabel(localValue[0])}
        </div>
        <div className="text-gray-400">-</div>
        <div className="px-3 py-1 bg-gray-100 rounded-md border border-gray-200">
          {formatLabel(localValue[1])}
        </div>
      </div>
    </div>;
}