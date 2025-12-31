import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Gift, Crown, Zap, Heart } from 'lucide-react';
interface AchievementBadgeProps {
  type: 'first-purchase' | 'loyalty-tier' | 'referral-master' | 'review-champion' | 'early-adopter' | 'vip';
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}
const achievementConfig = {
  'first-purchase': {
    icon: Gift,
    label: 'First Purchase',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  'loyalty-tier': {
    icon: Star,
    label: 'Gold Member',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600'
  },
  'referral-master': {
    icon: Heart,
    label: 'Referral Master',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600'
  },
  'review-champion': {
    icon: Trophy,
    label: 'Review Champion',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600'
  },
  'early-adopter': {
    icon: Zap,
    label: 'Early Adopter',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600'
  },
  vip: {
    icon: Crown,
    label: 'VIP Member',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600'
  }
};
const sizeConfig = {
  sm: {
    container: 'w-10 h-10',
    icon: 'h-5 w-5',
    text: 'text-xs'
  },
  md: {
    container: 'w-16 h-16',
    icon: 'h-8 w-8',
    text: 'text-sm'
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'h-12 w-12',
    text: 'text-base'
  }
};
export function AchievementBadge({
  type,
  unlocked,
  size = 'md',
  showLabel = true
}: AchievementBadgeProps) {
  const config = achievementConfig[type];
  const sizes = sizeConfig[size];
  const Icon = config.icon;
  return <div className="flex flex-col items-center gap-2">
      <motion.div whileHover={unlocked ? {
      scale: 1.1,
      rotate: 5
    } : {}} className={`relative ${sizes.container} rounded-full flex items-center justify-center ${unlocked ? config.bgColor : 'bg-gray-100'} ${unlocked ? 'shadow-lg' : ''}`}>
        {unlocked ? <>
            <div className={`absolute inset-0 bg-gradient-to-br ${config.color} rounded-full opacity-20`} />
            <Icon className={`${sizes.icon} ${config.textColor} relative z-10`} />
            <motion.div className={`absolute inset-0 bg-gradient-to-br ${config.color} rounded-full opacity-0`} animate={{
          opacity: [0, 0.3, 0],
          scale: [1, 1.2, 1]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
          </> : <Icon className={`${sizes.icon} text-gray-400`} />}
      </motion.div>

      {showLabel && <div className="text-center">
          <p className={`${sizes.text} font-medium ${unlocked ? 'text-gray-900' : 'text-gray-400'}`}>
            {config.label}
          </p>
          {!unlocked && <p className="text-xs text-gray-400 mt-0.5">Locked</p>}
        </div>}
    </div>;
}