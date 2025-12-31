import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Image as ImageIcon, CheckCircle, Filter, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { useReviewsStore } from '../../stores/reviewsStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { Review, ReviewReply } from '../../api/reviews';
import { PremiumLoader } from '../ui/PremiumLoader';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const productIdNum = parseInt(productId);
  const { isAuthenticated, user } = useAuthStore();
  const addToast = useToastStore(state => state.addToast);
  
  const {
    reviews,
    stats,
    pagination,
    loading,
    loadingStats,
    error,
    loadReviews,
    loadStats,
    voteReview,
    replyToReview,
    removeReview
  } = useReviewsStore();

  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'highest' | 'lowest'>('newest');
  const [page, setPage] = useState(1);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [votingReviewId, setVotingReviewId] = useState<number | null>(null);

  const productReviews = reviews[productIdNum] || [];
  const productStats = stats[productIdNum];
  const isLoading = loading[productIdNum] || false;
  const isLoadingStats = loadingStats[productIdNum] || false;
  const errorMessage = error[productIdNum];
  const productPagination = pagination[productIdNum];

  // Cargar stats primero (UX más rápido)
  useEffect(() => {
    if (productIdNum && !productStats && !isLoadingStats) {
      loadStats(productIdNum);
    }
  }, [productIdNum, productStats, isLoadingStats, loadStats]);

  // Cargar reviews
  useEffect(() => {
    if (productIdNum) {
      loadReviews(productIdNum, {
        page,
        limit: 10,
        rating: filterRating || undefined,
        with_images: false
      });
    }
  }, [productIdNum, page, filterRating, loadReviews]);

  // Filtrar y ordenar reviews
  const filteredAndSortedReviews = React.useMemo(() => {
    let result = [...productReviews];

    // Ordenar
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'helpful') {
      result.sort((a, b) => (b.helpful_count - b.not_helpful_count) - (a.helpful_count - a.not_helpful_count));
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [productReviews, sortBy]);

  // Obtener todas las imágenes de reviews
  const allReviewImages = React.useMemo(() => {
    return productReviews
      .flatMap(r => r.images || [])
      .filter(Boolean)
      .slice(0, 12); // Máximo 12 imágenes en la galería
  }, [productReviews]);

  const handleVote = async (reviewId: number, helpful: boolean) => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        message: 'Debes iniciar sesión para votar'
      });
      return;
    }

    setVotingReviewId(reviewId);
    try {
      await voteReview(productIdNum, reviewId, helpful);
      addToast({
        type: 'success',
        message: helpful ? 'Marcado como útil' : 'Marcado como no útil'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al votar'
      });
    } finally {
      setVotingReviewId(null);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      await removeReview(productIdNum, reviewId);
      addToast({
        type: 'success',
        message: 'Reseña eliminada'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al eliminar reseña'
      });
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Loading state
  if (isLoadingStats && !productStats) {
    return (
      <div className="space-y-12">
        <PremiumLoader />
      </div>
    );
  }

  // Error state
  if (errorMessage && !productStats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <Button onClick={() => loadStats(productIdNum)}>Reintentar</Button>
      </div>
    );
  }

  const averageRating = productStats?.average || 0;
  const totalReviews = productStats?.total || 0;
  const distribution = productStats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="space-y-12">
      {/* Reviews Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 text-center md:text-left">
          <h3 className="text-5xl font-serif font-bold text-gray-900 mb-2">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </h3>
          <div className="flex justify-center md:justify-start gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.floor(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : star <= averageRating
                    ? 'fill-yellow-200 text-yellow-200'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-500">
            Basado en {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
          </p>
          {isAuthenticated ? (
            <Button className="mt-6" fullWidth onClick={() => setShowWriteReview(true)}>
              Escribir una Reseña
            </Button>
          ) : (
            <Button className="mt-6" fullWidth variant="outline" disabled>
              Inicia sesión para escribir una reseña
            </Button>
          )}
        </div>

        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const percentage = distribution[rating as keyof typeof distribution] || 0;
            return (
              <div key={rating} className="flex items-center gap-4">
                <button
                  onClick={() => setFilterRating(rating === filterRating ? null : rating)}
                  className={`text-sm font-medium w-12 hover:underline ${
                    filterRating === rating ? 'text-rose-600 font-bold' : 'text-gray-600'
                  }`}
                >
                  {rating} {rating === 1 ? 'estrella' : 'estrellas'}
                </button>
                <div className="flex-1">
                  <ProgressBar progress={percentage} height={6} color="bg-yellow-400" />
                </div>
                <span className="text-sm text-gray-400 w-8 text-right">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Media Gallery */}
      {allReviewImages.length > 0 && (
        <div>
          <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-gray-500" /> Fotos de Clientes
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {allReviewImages.map((img, idx) => (
              <button
                key={idx}
                className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img src={img} alt="Customer review" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h3 className="font-serif font-bold text-lg">Reseñas</h3>
            {filterRating && (
              <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full flex items-center gap-1">
                {filterRating} {filterRating === 1 ? 'Estrella' : 'Estrellas'}{' '}
                <button onClick={() => setFilterRating(null)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border-gray-200 rounded-lg focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="newest">Más Recientes</option>
            <option value="helpful">Más Útiles</option>
            <option value="highest">Mejor Valoradas</option>
            <option value="lowest">Peor Valoradas</option>
          </select>
        </div>

        {isLoading && filteredAndSortedReviews.length === 0 ? (
          <PremiumLoader />
        ) : filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {filterRating
                ? `No hay reseñas con ${filterRating} ${filterRating === 1 ? 'estrella' : 'estrellas'}`
                : 'Aún no hay reseñas para este producto'}
            </p>
            {filterRating && (
              <Button variant="outline" onClick={() => setFilterRating(null)}>
                Ver todas las reseñas
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {filteredAndSortedReviews.map(review => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  currentUserId={user?.id ? parseInt(user.id) : null}
                  isAuthenticated={isAuthenticated}
                  onVote={handleVote}
                  onDelete={handleDelete}
                  onReply={replyToReview}
                  votingReviewId={votingReviewId}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {/* Paginación */}
            {productPagination && productPagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {page} de {productPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(productPagination.totalPages, p + 1))}
                  disabled={page >= productPagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Componente ReviewItem separado
interface ReviewItemProps {
  review: Review;
  currentUserId: number | null;
  isAuthenticated: boolean;
  onVote: (reviewId: number, helpful: boolean) => void;
  onDelete: (reviewId: number) => void;
  onReply: (productId: number, reviewId: number, content: string) => Promise<void>;
  votingReviewId: number | null;
  formatDate: (date: string) => string;
}

function ReviewItem({
  review,
  currentUserId,
  isAuthenticated,
  onVote,
  onDelete,
  onReply,
  votingReviewId,
  formatDate
}: ReviewItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const isOwner = currentUserId === review.user_id;
  const canDelete = isOwner; // Solo el autor puede eliminar

  const handleReply = async () => {
    if (!replyContent.trim()) {
      addToast({
        type: 'error',
        message: 'El contenido de la respuesta no puede estar vacío'
      });
      return;
    }

    setIsSubmittingReply(true);
    try {
      await onReply(review.product_id, review.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
      addToast({
        type: 'success',
        message: 'Respuesta enviada'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al enviar respuesta'
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-100 pb-8 last:border-0"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="font-bold text-gray-900">{review.user_name}</div>
          {review.verified_purchase && (
            <span className="text-green-600 text-xs flex items-center gap-0.5">
              <CheckCircle className="h-3 w-3" /> Compra Verificada
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
            }`}
          />
        ))}
      </div>

      {review.title && <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>}
      <p className="text-gray-600 mb-4 leading-relaxed">{review.content}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4">
          {review.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Review"
              className="h-20 w-20 object-cover rounded-lg border border-gray-100"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50"
          onClick={() => onVote(review.id, true)}
          disabled={votingReviewId === review.id || !isAuthenticated}
        >
          {votingReviewId === review.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp className="h-4 w-4" />
          )}{' '}
          Útil ({review.helpful_count})
        </button>
        <button
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50"
          onClick={() => onVote(review.id, false)}
          disabled={votingReviewId === review.id || !isAuthenticated}
        >
          {votingReviewId === review.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4" />
          )}{' '}
          No útil ({review.not_helpful_count})
        </button>
        {canDelete && (
          <button
            className="text-sm text-red-500 hover:text-red-700"
            onClick={() => onDelete(review.id)}
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Replies */}
      {review.replies && review.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {review.replies.map(reply => (
            <div
              key={reply.id}
              className="bg-gray-50 p-4 rounded-lg border-l-4 border-rose-200"
            >
              <p className="text-sm font-bold text-gray-900 mb-1">
                {reply.is_admin ? 'Respuesta de Rose Secret:' : `Respuesta de ${reply.user_name}:`}
              </p>
              <p className="text-sm text-gray-600">{reply.content}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDate(reply.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
