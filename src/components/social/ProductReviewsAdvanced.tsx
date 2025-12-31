import React, { useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Camera, CheckCircle, Filter, ChevronDown, Award, TrendingUp, Users } from 'lucide-react';
import { useSocialStore, Review } from '../../stores/socialStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
// Advanced Product Reviews Component
// Full-featured review system with ratings, photos, verified purchases, and helpful votes
interface ProductReviewsAdvancedProps {
  productId: string;
}
export function ProductReviewsAdvanced({
  productId
}: ProductReviewsAdvancedProps) {
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('helpful');
  const reviews = useSocialStore(state => state.getProductReviews(productId));
  const averageRating = useSocialStore(state => state.getAverageRating(productId));
  const distribution = useSocialStore(state => state.getRatingDistribution(productId));
  const voteHelpful = useSocialStore(state => state.voteHelpful);
  // Filter and sort reviews
  const filteredReviews = reviews.filter(review => filterRating === null || review.rating === filterRating).sort((a, b) => {
    if (sortBy === 'recent') return b.createdAt - a.createdAt;
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });
  const totalReviews = reviews.length;
  const verifiedCount = reviews.filter(r => r.verified).length;
  return <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 border border-rose-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div className="text-6xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-6 h-6 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                </div>
                <p className="text-sm text-gray-600">
                  Basado en {totalReviews} reseñas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{verifiedCount} compras verificadas</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>95% recomiendan</span>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
            const count = distribution[rating] || 0;
            const percentage = totalReviews > 0 ? count / totalReviews * 100 : 0;
            return <button key={rating} onClick={() => setFilterRating(filterRating === rating ? null : rating)} className={`
                    w-full flex items-center gap-3 p-2 rounded-lg transition-all
                    ${filterRating === rating ? 'bg-white shadow-sm' : 'hover:bg-white/50'}
                  `}>
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400" initial={{
                  width: 0
                }} animate={{
                  width: `${percentage}%`
                }} transition={{
                  duration: 0.5,
                  delay: (5 - rating) * 0.1
                }} />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {count}
                  </span>
                </button>;
          })}
          </div>
        </div>

        {/* Write Review Button */}
        <div className="mt-6 pt-6 border-t border-rose-200">
          <Button onClick={() => setShowWriteReview(true)} leftIcon={<Camera className="w-5 h-5" />} className="w-full md:w-auto">
            Escribir Reseña
          </Button>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {filterRating ? `${filterRating} estrellas` : 'Todas las reseñas'}
          </span>
          {filterRating && <button onClick={() => setFilterRating(null)} className="text-sm text-rose-600 hover:text-rose-700">
              Limpiar
            </button>}
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
          <option value="helpful">Más útiles</option>
          <option value="recent">Más recientes</option>
          <option value="rating">Mayor calificación</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredReviews.length === 0 ? <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filterRating ? 'No hay reseñas con esta calificación' : 'Sé el primero en opinar'}
              </h3>
              <p className="text-gray-600 mb-6">
                Comparte tu experiencia con este producto
              </p>
              <Button onClick={() => setShowWriteReview(true)}>
                Escribir Reseña
              </Button>
            </motion.div> : filteredReviews.map((review, index) => <ReviewCard key={review.id} review={review} index={index} onVoteHelpful={helpful => voteHelpful(review.id, helpful)} />)}
        </AnimatePresence>
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal productId={productId} isOpen={showWriteReview} onClose={() => setShowWriteReview(false)} />
    </div>;
}
// Review Card Component
interface ReviewCardProps {
  review: Review;
  index: number;
  onVoteHelpful: (helpful: boolean) => void;
}
function ReviewCard({
  review,
  index,
  onVoteHelpful
}: ReviewCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const handleVote = (helpful: boolean) => {
    if (!hasVoted) {
      onVoteHelpful(helpful);
      setHasVoted(true);
    }
  };
  const contentPreview = review.content.slice(0, 200);
  const needsExpansion = review.content.length > 200;
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: -20
  }} transition={{
    delay: index * 0.05
  }} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
            {review.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{review.userName}</h4>
              {review.verified && <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      {review.title && <h5 className="font-bold text-gray-900 mb-3">{review.title}</h5>}

      {/* Content */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {showFullContent || !needsExpansion ? review.content : contentPreview}
        {needsExpansion && !showFullContent && '...'}
      </p>

      {needsExpansion && <button onClick={() => setShowFullContent(!showFullContent)} className="text-sm font-semibold text-rose-600 hover:text-rose-700 mb-4 flex items-center gap-1">
          {showFullContent ? 'Ver menos' : 'Ver más'}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFullContent ? 'rotate-180' : ''}`} />
        </button>}

      {/* Images */}
      {review.images && review.images.length > 0 && <div className="flex gap-2 mb-4 overflow-x-auto">
          {review.images.map((image, idx) => <img key={idx} src={image} alt={`Review ${idx + 1}`} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />)}
        </div>}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => handleVote(true)} disabled={hasVoted} className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
              ${hasVoted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-green-50 text-gray-600 hover:text-green-600'}
            `}>
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">{review.helpful}</span>
          </button>

          <button onClick={() => handleVote(false)} disabled={hasVoted} className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
              ${hasVoted ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-red-50 text-gray-600 hover:text-red-600'}
            `}>
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm font-medium">{review.notHelpful}</span>
          </button>
        </div>

        {review.replies && review.replies.length > 0 && <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <MessageCircle className="w-4 h-4" />
            {review.replies.length} respuestas
          </button>}
      </div>
    </motion.div>;
}
// Write Review Modal Component
interface WriteReviewModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}
function WriteReviewModal({
  productId,
  isOpen,
  onClose
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addReview = useSocialStore(state => state.addReview);
  const handleSubmit = async () => {
    if (rating === 0 || !content.trim()) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    addReview({
      productId,
      userId: 'current-user',
      userName: 'Usuario Actual',
      rating,
      title: title.trim(),
      content: content.trim(),
      verified: true
    });
    setIsSubmitting(false);
    onClose();
    // Reset form
    setRating(0);
    setTitle('');
    setContent('');
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} exit={{
      opacity: 0,
      scale: 0.95
    }} className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-6">
          Escribe tu Reseña
        </h2>

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Calificación *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} className="transition-transform hover:scale-110">
                <Star className={`w-10 h-10 ${star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>)}
            {rating > 0 && <span className="ml-2 text-sm font-medium text-gray-600">
                {rating === 5 ? '¡Excelente!' : rating === 4 ? 'Muy bueno' : rating === 3 ? 'Bueno' : rating === 2 ? 'Regular' : 'Malo'}
              </span>}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Título (opcional)
          </label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Resume tu experiencia" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500" maxLength={100} />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tu reseña *
          </label>
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Comparte tu experiencia con este producto..." rows={6} className="w-full" maxLength={1000} />
          <p className="text-sm text-gray-500 mt-2">
            {content.length}/1000 caracteres
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || !content.trim() || isSubmitting}>
            {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
          </Button>
        </div>
      </motion.div>
    </div>;
}