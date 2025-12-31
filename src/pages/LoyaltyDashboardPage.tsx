import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gift, Trophy, Share2, ArrowRight, Lock, Unlock } from 'lucide-react';
import { CircularProgress } from '../components/ui/CircularProgress';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { AchievementBadge } from '../components/ui/AchievementBadge';
import { Confetti } from '../components/ui/Confetti';
export function LoyaltyDashboardPage() {
  const [showConfetti, setShowConfetti] = useState(false);
  const points = 1250;
  const nextTierPoints = 2000;
  const tierProgress = points / nextTierPoints * 100;
  const rewards = [{
    id: 1,
    title: '$10 Off Coupon',
    points: 500,
    icon: Gift
  }, {
    id: 2,
    title: 'Free Shipping',
    points: 800,
    icon: TruckIcon
  }, {
    id: 3,
    title: 'Mystery Gift Box',
    points: 1500,
    icon: Sparkles
  }, {
    id: 4,
    title: 'VIP Event Access',
    points: 2500,
    icon: Trophy
  }];
  const handleRedeem = (pointsCost: number) => {
    if (points >= pointsCost) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      // Logic to deduct points would go here
    }
  };
  return <div className="bg-gray-50 min-h-screen py-12">
      <Confetti isActive={showConfetti} />

      <div className="container-custom">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">
            Rose Rewards
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Earn points with every purchase and unlock exclusive luxury rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Status Card */}
          <GlassCard className="lg:col-span-2 p-8 relative overflow-hidden" blur="md" glow>
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100 rounded-full blur-[80px] -z-10" />

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <CircularProgress value={points} max={nextTierPoints} size={180} strokeWidth={12} color="#E11D48">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{points}</p>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">
                      Points
                    </p>
                  </div>
                </CircularProgress>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                  Gold Tier
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-serif font-bold mb-2">
                  You're doing great!
                </h2>
                <p className="text-gray-600 mb-6">
                  Only <strong>{nextTierPoints - points} points</strong> away
                  from Platinum Tier. Unlock free express shipping and early
                  access to sales.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Gold</span>
                    <span>Platinum</span>
                  </div>
                  <ProgressBar progress={tierProgress} height={8} color="bg-gradient-to-r from-rose-500 to-purple-600" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <div className="space-y-4">
            <GlassCard className="p-6" blur="sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-rose-500" /> Refer a Friend
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Give $20, Get $20. Earn points for every friend who makes a
                purchase.
              </p>
              <Button fullWidth variant="outline">
                Copy Link
              </Button>
            </GlassCard>

            <GlassCard className="p-6" blur="sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Daily Challenge
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Review a recent purchase to earn 50 bonus points today.
              </p>
              <Button fullWidth>Write Review</Button>
            </GlassCard>
          </div>
        </div>

        {/* Rewards Catalog */}
        <h2 className="font-serif text-2xl font-bold mb-6">Rewards Catalog</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {rewards.map(reward => <motion.div key={reward.id} whileHover={{
          y: -5
        }} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <reward.icon className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{reward.title}</h3>
              <p className="text-rose-600 font-medium mb-4">
                {reward.points} Points
              </p>

              <Button fullWidth disabled={points < reward.points} onClick={() => handleRedeem(reward.points)} variant={points >= reward.points ? 'primary' : 'secondary'}>
                {points >= reward.points ? 'Redeem' : 'Locked'}
              </Button>

              {points < reward.points && <div className="absolute top-4 right-4 text-gray-300">
                  <Lock className="h-5 w-5" />
                </div>}
            </motion.div>)}
        </div>

        {/* Achievements */}
        <h2 className="font-serif text-2xl font-bold mb-6">
          Your Achievements
        </h2>
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="flex flex-wrap justify-center gap-8">
            <AchievementBadge type="first-purchase" unlocked size="lg" />
            <AchievementBadge type="loyalty-tier" unlocked size="lg" />
            <AchievementBadge type="referral-master" unlocked={false} size="lg" />
            <AchievementBadge type="review-champion" unlocked={false} size="lg" />
            <AchievementBadge type="early-adopter" unlocked size="lg" />
            <AchievementBadge type="vip" unlocked={false} size="lg" />
          </div>
        </div>
      </div>
    </div>;
}
function TruckIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17h4V5H2v12h3" />
      <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
      <path d="M14 17h1" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>;
}