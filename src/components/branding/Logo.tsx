import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSetting } from '../../hooks/useAppSettings';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  linkTo?: string;
  useDark?: boolean;
}
const sizeMap = {
  xs: {
    full: 'h-6',
    compact: 'h-5',
    icon: 'h-4'
  },
  sm: {
    full: 'h-8',
    compact: 'h-6',
    icon: 'h-5'
  },
  md: {
    full: 'h-10',
    compact: 'h-8',
    icon: 'h-6'
  },
  lg: {
    full: 'h-14',
    compact: 'h-10',
    icon: 'h-8'
  },
  xl: {
    full: 'h-20',
    compact: 'h-14',
    icon: 'h-10'
  }
};
export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  animated = false,
  linkTo = '/',
  useDark = false
}: LogoProps) {
  const { value: logoUrl } = useAppSetting(useDark ? 'logo_dark_url' : 'logo_url');
  const fallbackLogo = "/t.webp";
  const finalLogoUrl = logoUrl || fallbackLogo;
  const heightClass = sizeMap[size][variant];
  const logoImage = <motion.img src={finalLogoUrl} alt="Rose Secret" className={`${heightClass} w-auto object-contain ${className}`} initial={animated ? {
    opacity: 0,
    scale: 0.9
  } : false} animate={animated ? {
    opacity: 1,
    scale: 1
  } : false} transition={{
    duration: 0.5,
    ease: [0.25, 0.1, 0.25, 1]
  }} whileHover={animated ? {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  } : undefined} />;
  if (linkTo) {
    return <Link to={linkTo} className="inline-flex items-center">
        {logoImage}
      </Link>;
  }
  return logoImage;
}
// Variante con texto para branding completo
export function LogoWithText({
  size = 'md',
  className = '',
  animated = false
}: Omit<LogoProps, 'variant'>) {
  const { value: logoUrl } = useAppSetting('logo_url');
  const { value: platformName } = useAppSetting('platform_name');
  const { value: platformTagline } = useAppSetting('platform_tagline');
  const fallbackLogo = "/t.webp";
  const finalLogoUrl = logoUrl || fallbackLogo;
  const finalName = platformName || 'Rose Secret';
  const finalTagline = platformTagline || 'Luxury Fragrances';
  
  return <motion.div className={`flex items-center gap-3 ${className}`} initial={animated ? {
    opacity: 0,
    x: -20
  } : false} animate={animated ? {
    opacity: 1,
    x: 0
  } : false} transition={{
    duration: 0.6,
    ease: [0.25, 0.1, 0.25, 1]
  }}>
      <img src={finalLogoUrl} alt={finalName} className={`${sizeMap[size].icon} w-auto object-contain`} />
      <div className="flex flex-col">
        <span className="font-serif text-xl font-bold text-gray-900">
          {finalName}
        </span>
        <span className="text-xs text-gray-500 tracking-wider uppercase">
          {finalTagline}
        </span>
      </div>
    </motion.div>;
}