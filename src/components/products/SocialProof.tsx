import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, Heart, Star } from 'lucide-react';
import { getRecentActivities, SocialActivity } from '../../api/social-proof';

export function SocialProof() {
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;

    // Initial delay
    const initialTimer = setTimeout(() => setIsVisible(true), 8000);

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 500); // Wait for exit animation
    }, 15000); // Show every 15 seconds

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [activities]);

  const loadActivities = async () => {
    try {
      const response = await getRecentActivities({ limit: 10, hours: 24 });
      if (response.success && response.data) {
        setActivities(response.data.activities || []);
      }
    } catch (error) {
      console.error('Error loading social proof activities:', error);
      // Silently fail - don't show component if no data
      setActivities([]);
    }
  };

  // Don't render if no activities
  if (activities.length === 0) return null;

  const activity = activities[currentIndex];
  if (!activity) return null;

  const getActionIcon = () => {
    switch (activity.type) {
      case 'purchased':
        return <ShoppingBag className="w-3 h-3 text-white" />;
      case 'wishlisted':
        return <Heart className="w-3 h-3 text-white" />;
      case 'reviewed':
        return <Star className="w-3 h-3 text-white" />;
    }
  };

  const getActionColor = () => {
    switch (activity.type) {
      case 'purchased':
        return 'bg-emerald-500';
      case 'wishlisted':
        return 'bg-rose-500';
      case 'reviewed':
        return 'bg-amber-500';
    }
  };

  const getActionText = () => {
    switch (activity.type) {
      case 'purchased':
        return 'compró';
      case 'wishlisted':
        return 'guardó';
      case 'reviewed':
        return 'reseñó';
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40 hidden lg:block pointer-events-none">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-premium-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 max-w-xs pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              {activity.product_image && (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <img
                    src={activity.product_image}
                    alt={activity.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`${getActionColor()} rounded-full p-1 flex-shrink-0`}>
                    {getActionIcon()}
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.user_name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getActionText()}
                  </span>
                </div>
                
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {activity.product_name}
                </p>
                
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{activity.location}</span>
                  <span>·</span>
                  <span>{activity.time_ago}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}