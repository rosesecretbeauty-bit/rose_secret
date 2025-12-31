import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Gift, Star, Truck, Shield, ChevronRight, Lock, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useLoyaltyStore } from '../../stores/loyaltyStore';
import { useToastStore } from '../../stores/toastStore';

export function LoyaltyProgram() {
  const { info, tiers, rewards, loading, loadLoyaltyInfo, loadTiers, loadRewards, redeem } = useLoyaltyStore();
  const addToast = useToastStore(state => state.addToast);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);

  useEffect(() => {
    loadLoyaltyInfo();
    loadTiers();
    loadRewards();
  }, [loadLoyaltyInfo, loadTiers, loadRewards]);

  const handleRedeem = async (rewardId: number) => {
    try {
      setRedeemingId(rewardId);
      await redeem(rewardId);
      addToast({
        type: 'success',
        message: 'Recompensa canjeada exitosamente'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al canjear recompensa'
      });
    } finally {
      setRedeemingId(null);
    }
  };

  if (loading && !info) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  const currentTier = info?.current_tier?.slug || 'bronze';
  const points = info?.current_points || 0;
  const pointsToNext = info?.points_to_next || 0;
  const lifetimePoints = info?.lifetime_points || 0;
  
  // Mapear color del tier
  const getTierColor = (slug: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-orange-100 text-orange-800 border-orange-200',
      silver: 'bg-gray-100 text-gray-800 border-gray-200',
      gold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      platinum: 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colors[slug] || colors.bronze;
  };
  return <div className="space-y-12">
      {/* Hero Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-6 w-6 text-yellow-400" />
              <span className="text-yellow-400 font-medium tracking-wider uppercase text-sm">
                Rose Rewards
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {info?.current_tier?.name || 'Bronze'} Member
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              You're earning points at {info?.current_tier?.points_multiplier || 1}x multiplier.
            </p>

            {info?.next_tier && (
              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-sm">
                  <span>Progress to {info.next_tier.name}</span>
                  <span>
                    {points} / {info.next_tier.min_points}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600" 
                    style={{ width: `${Math.min((points / info.next_tier.min_points) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Earn {pointsToNext} more points to unlock {info.next_tier.name} benefits.
                </p>
              </div>
            )}

            <Button className="bg-white text-gray-900 hover:bg-gray-100">
              View History
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Available Points</p>
              <p className="text-3xl font-bold">{points.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Lifetime Earned</p>
              <p className="text-3xl font-bold">
                {lifetimePoints.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10 col-span-2">
              <p className="text-sm text-gray-400 mb-1">Next Reward</p>
              <p className="text-xl font-bold flex items-center gap-2">
                <Gift className="h-5 w-5 text-rose-400" />
                Free Luxury Sample Kit
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tiers Comparison */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-gray-900 mb-8 text-center">
          Membership Tiers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map(tier => {
          const isCurrent = tier.slug === currentTier;
          const isLocked = tier.min_points > points;
          const tierColor = getTierColor(tier.slug);
          return <motion.div key={tier.id} whileHover={{
            y: -5
          }} className={`relative rounded-2xl p-6 border-2 transition-all ${isCurrent ? 'border-rose-500 bg-white shadow-xl ring-4 ring-rose-100' : 'border-gray-100 bg-gray-50'}`}>
                {isCurrent && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    Current Status
                  </div>}

                <div className="text-center mb-6 mt-2">
                  <h4 className="font-serif text-xl font-bold mb-1">
                    {tier.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {tier.min_points}+ Points
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.benefits.map((benefit, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className={`mt-0.5 rounded-full p-0.5 ${isLocked ? 'bg-gray-200' : 'bg-green-100'}`}>
                        {isLocked ? <Lock className="h-3 w-3 text-gray-400" /> : <CheckIcon className="h-3 w-3 text-green-600" />}
                      </div>
                      {benefit}
                    </li>)}
                </ul>
              </motion.div>;
        })}
        </div>
      </div>

      {/* Rewards Redemption */}
      <div>
        <h3 className="font-serif text-2xl font-bold text-gray-900 mb-8">
          Redeem Rewards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map(reward => {
            const iconMap: Record<string, any> = {
              gift: Gift,
              star: Star,
              crown: Crown,
              shield: Shield
            };
            const IconComponent = iconMap[reward.icon || 'gift'] || Gift;
            const canRedeem = points >= reward.cost;
            const isRedeeming = redeemingId === reward.id;
            
            return (
              <Card key={reward.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{reward.name}</h4>
                  {reward.description && (
                    <p className="text-sm text-gray-500 mb-2">{reward.description}</p>
                  )}
                  <p className="text-rose-600 font-bold mb-4">
                    {reward.points_cost} Points
                  </p>
                  <Button 
                    fullWidth 
                    variant={canRedeem ? 'primary' : 'outline'} 
                    disabled={!canRedeem || isRedeeming}
                    onClick={() => canRedeem && handleRedeem(reward.id)}
                  >
                    {isRedeeming ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Canjeando...
                      </>
                    ) : canRedeem ? (
                      'Redeem'
                    ) : (
                      `Need ${reward.points_cost - points} more`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>;
}
function CheckIcon({
  className
}: {
  className?: string;
}) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>;
}