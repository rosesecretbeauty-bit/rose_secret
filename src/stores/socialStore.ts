import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Social Store - Manages user reviews, ratings, and social interactions
// Enables community features and user-generated content

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title: string;
  content: string;
  images?: string[];
  verified: boolean; // Verified purchase
  helpful: number; // Helpful votes
  notHelpful: number; // Not helpful votes
  createdAt: number;
  updatedAt: number;
  replies?: ReviewReply[];
}
export interface ReviewReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  isAdmin: boolean;
  createdAt: number;
}
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: number;
  reviewCount: number;
  helpfulVotes: number;
  followers: number;
  following: number;
  badges: UserBadge[];
}
export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: number;
}
export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'review' | 'photo' | 'video' | 'look' | 'tip';
  content: string;
  media?: string[];
  products?: string[]; // Product IDs
  likes: number;
  comments: number;
  shares: number;
  createdAt: number;
}
interface SocialState {
  // Reviews
  reviews: Review[];
  userReviews: Review[];

  // User Profile
  currentUserProfile: UserProfile | null;

  // Social Feed
  socialFeed: SocialPost[];

  // Actions - Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'helpful' | 'notHelpful' | 'replies'>) => void;
  updateReview: (reviewId: string, updates: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;
  voteHelpful: (reviewId: string, helpful: boolean) => void;
  addReply: (reviewId: string, reply: Omit<ReviewReply, 'id' | 'createdAt'>) => void;

  // Actions - User Profile
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addBadge: (badge: UserBadge) => void;

  // Actions - Social Feed
  addPost: (post: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares'>) => void;
  likePost: (postId: string) => void;
  sharePost: (postId: string) => void;

  // Getters
  getProductReviews: (productId: string) => Review[];
  getAverageRating: (productId: string) => number;
  getRatingDistribution: (productId: string) => Record<number, number>;
}
export const useSocialStore = create<SocialState>()(persist((set, get) => ({
  // Initial State
  reviews: [],
  userReviews: [],
  currentUserProfile: null,
  socialFeed: [],
  // Add Review
  addReview: review => {
    const newReview: Review = {
      ...review,
      id: `review_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      helpful: 0,
      notHelpful: 0,
      replies: []
    };
    set(state => ({
      reviews: [newReview, ...state.reviews],
      userReviews: [newReview, ...state.userReviews]
    }));

    // Update user profile review count
    if (get().currentUserProfile) {
      set(state => ({
        currentUserProfile: state.currentUserProfile ? {
          ...state.currentUserProfile,
          reviewCount: state.currentUserProfile.reviewCount + 1
        } : null
      }));
    }

    // Check for badges
    get().checkReviewBadges();
  },
  // Update Review
  updateReview: (reviewId, updates) => {
    set(state => ({
      reviews: state.reviews.map(review => review.id === reviewId ? {
        ...review,
        ...updates,
        updatedAt: Date.now()
      } : review),
      userReviews: state.userReviews.map(review => review.id === reviewId ? {
        ...review,
        ...updates,
        updatedAt: Date.now()
      } : review)
    }));
  },
  // Delete Review
  deleteReview: reviewId => {
    set(state => ({
      reviews: state.reviews.filter(review => review.id !== reviewId),
      userReviews: state.userReviews.filter(review => review.id !== reviewId)
    }));

    // Update user profile review count
    if (get().currentUserProfile) {
      set(state => ({
        currentUserProfile: state.currentUserProfile ? {
          ...state.currentUserProfile,
          reviewCount: Math.max(0, state.currentUserProfile.reviewCount - 1)
        } : null
      }));
    }
  },
  // Vote Helpful
  voteHelpful: (reviewId, helpful) => {
    set(state => ({
      reviews: state.reviews.map(review => review.id === reviewId ? {
        ...review,
        helpful: helpful ? review.helpful + 1 : review.helpful,
        notHelpful: !helpful ? review.notHelpful + 1 : review.notHelpful
      } : review)
    }));
  },
  // Add Reply
  addReply: (reviewId, reply) => {
    const newReply: ReviewReply = {
      ...reply,
      id: `reply_${Date.now()}`,
      createdAt: Date.now()
    };
    set(state => ({
      reviews: state.reviews.map(review => review.id === reviewId ? {
        ...review,
        replies: [...(review.replies || []), newReply]
      } : review)
    }));
  },
  // Update User Profile
  updateUserProfile: updates => {
    set(state => ({
      currentUserProfile: state.currentUserProfile ? {
        ...state.currentUserProfile,
        ...updates
      } : null
    }));
  },
  // Add Badge
  addBadge: badge => {
    set(state => ({
      currentUserProfile: state.currentUserProfile ? {
        ...state.currentUserProfile,
        badges: [...state.currentUserProfile.badges, badge]
      } : null
    }));
  },
  // Add Post
  addPost: post => {
    const newPost: SocialPost = {
      ...post,
      id: `post_${Date.now()}`,
      createdAt: Date.now(),
      likes: 0,
      comments: 0,
      shares: 0
    };
    set(state => ({
      socialFeed: [newPost, ...state.socialFeed]
    }));
  },
  // Like Post
  likePost: postId => {
    set(state => ({
      socialFeed: state.socialFeed.map(post => post.id === postId ? {
        ...post,
        likes: post.likes + 1
      } : post)
    }));
  },
  // Share Post
  sharePost: postId => {
    set(state => ({
      socialFeed: state.socialFeed.map(post => post.id === postId ? {
        ...post,
        shares: post.shares + 1
      } : post)
    }));
  },
  // Get Product Reviews
  getProductReviews: productId => {
    return get().reviews.filter(review => review.productId === productId);
  },
  // Get Average Rating
  getAverageRating: productId => {
    const productReviews = get().getProductReviews(productId);
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / productReviews.length;
  },
  // Get Rating Distribution
  getRatingDistribution: productId => {
    const productReviews = get().getProductReviews(productId);
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    productReviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  },
  // Check Review Badges (internal)
  checkReviewBadges: () => {
    const profile = get().currentUserProfile;
    if (!profile) return;
    const reviewCount = profile.reviewCount;

    // First Review Badge
    if (reviewCount === 1 && !profile.badges.find(b => b.id === 'first-review')) {
      get().addBadge({
        id: 'first-review',
        name: 'Primera Reseña',
        icon: '✍️',
        description: 'Escribiste tu primera reseña',
        earnedAt: Date.now()
      });
    }

    // Active Reviewer Badge
    if (reviewCount === 5 && !profile.badges.find(b => b.id === 'active-reviewer')) {
      get().addBadge({
        id: 'active-reviewer',
        name: 'Revisor Activo',
        icon: '⭐',
        description: 'Escribiste 5 reseñas',
        earnedAt: Date.now()
      });
    }

    // Expert Reviewer Badge
    if (reviewCount === 20 && !profile.badges.find(b => b.id === 'expert-reviewer')) {
      get().addBadge({
        id: 'expert-reviewer',
        name: 'Experto en Reseñas',
        icon: '🏆',
        description: 'Escribiste 20 reseñas',
        earnedAt: Date.now()
      });
    }

    // Helpful Reviewer Badge
    if (profile.helpfulVotes >= 50 && !profile.badges.find(b => b.id === 'helpful-reviewer')) {
      get().addBadge({
        id: 'helpful-reviewer',
        name: 'Revisor Útil',
        icon: '👍',
        description: 'Recibiste 50 votos útiles',
        earnedAt: Date.now()
      });
    }
  }
}), {
  name: 'rose-secret-social-storage',
  partialize: state => ({
    reviews: state.reviews,
    userReviews: state.userReviews,
    currentUserProfile: state.currentUserProfile,
    socialFeed: state.socialFeed
  })
}));