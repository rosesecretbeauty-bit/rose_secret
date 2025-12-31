// Machine Learning & Prediction System for Rose Secret
// Simulates ML-based predictions using behavioral patterns and heuristics

import { analyticsManager } from './advancedAnalytics';

// --- Types ---

export interface PurchaseIntentPrediction {
  score: number; // 0-100
  confidence: 'low' | 'medium' | 'high';
  factors: IntentFactor[];
  suggestedActions: string[];
  timeToConversion: number; // estimated minutes
}
export interface IntentFactor {
  name: string;
  weight: number;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
}
export interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
  category: 'trending' | 'personalized' | 'complementary' | 'similar';
  confidence: number;
}
export interface UserSegment {
  id: string;
  name: string;
  characteristics: string[];
  predictedLTV: number; // Lifetime Value
  churnRisk: number; // 0-100
  engagementLevel: 'low' | 'medium' | 'high' | 'very_high';
}

// --- Purchase Intent Prediction ---

class MLPredictionEngine {
  private static instance: MLPredictionEngine;
  static getInstance(): MLPredictionEngine {
    if (!MLPredictionEngine.instance) {
      MLPredictionEngine.instance = new MLPredictionEngine();
    }
    return MLPredictionEngine.instance;
  }

  // Predict purchase intent based on user behavior
  predictPurchaseIntent(): PurchaseIntentPrediction {
    const behavior = analyticsManager.getUserBehavior();
    const factors: IntentFactor[] = [];

    // Factor 1: Time on site
    const timeOnSiteMinutes = behavior.timeOnSite / 60000;
    const timeScore = Math.min(timeOnSiteMinutes * 10, 100);
    factors.push({
      name: 'Tiempo en el sitio',
      weight: 0.15,
      value: timeScore,
      impact: timeScore > 50 ? 'positive' : 'neutral'
    });

    // Factor 2: Pages visited
    const pagesScore = Math.min(behavior.pagesVisited * 15, 100);
    factors.push({
      name: 'Páginas visitadas',
      weight: 0.12,
      value: pagesScore,
      impact: pagesScore > 60 ? 'positive' : 'neutral'
    });

    // Factor 3: Product views
    const productViews = behavior.journey.filter(j => j.page.includes('/product/')).length;
    const productScore = Math.min(productViews * 25, 100);
    factors.push({
      name: 'Productos vistos',
      weight: 0.2,
      value: productScore,
      impact: productScore > 50 ? 'positive' : 'neutral'
    });

    // Factor 4: Cart interactions
    const cartInteractions = behavior.interactions.filter(i => i.element.includes('cart') || i.element.includes('add-to-cart')).length;
    const cartScore = Math.min(cartInteractions * 30, 100);
    factors.push({
      name: 'Interacciones con carrito',
      weight: 0.25,
      value: cartScore,
      impact: cartScore > 30 ? 'positive' : 'negative'
    });

    // Factor 5: Wishlist activity
    const wishlistInteractions = behavior.interactions.filter(i => i.element.includes('wishlist') || i.element.includes('heart')).length;
    const wishlistScore = Math.min(wishlistInteractions * 20, 100);
    factors.push({
      name: 'Actividad en wishlist',
      weight: 0.1,
      value: wishlistScore,
      impact: wishlistScore > 40 ? 'positive' : 'neutral'
    });

    // Factor 6: Search activity
    const searchCount = behavior.interactions.filter(i => i.type === 'search').length;
    const searchScore = Math.min(searchCount * 15, 100);
    factors.push({
      name: 'Búsquedas realizadas',
      weight: 0.08,
      value: searchScore,
      impact: searchScore > 30 ? 'positive' : 'neutral'
    });

    // Factor 7: Scroll depth (engagement)
    const scrollInteractions = behavior.interactions.filter(i => i.type === 'scroll');
    const avgScrollDepth = scrollInteractions.length > 0 ? scrollInteractions.reduce((sum, i) => sum + (i.metadata?.depth || 0), 0) / scrollInteractions.length : 0;
    const scrollScore = avgScrollDepth;
    factors.push({
      name: 'Profundidad de scroll',
      weight: 0.1,
      value: scrollScore,
      impact: scrollScore > 60 ? 'positive' : 'neutral'
    });

    // Calculate weighted score
    const totalScore = factors.reduce((sum, factor) => sum + factor.value * factor.weight, 0);

    // Determine confidence
    const positiveFactors = factors.filter(f => f.impact === 'positive').length;
    const confidence: 'low' | 'medium' | 'high' = positiveFactors >= 5 ? 'high' : positiveFactors >= 3 ? 'medium' : 'low';

    // Suggest actions based on score
    const suggestedActions: string[] = [];
    if (totalScore > 70) {
      suggestedActions.push('Ofrecer descuento urgente');
      suggestedActions.push('Mostrar productos similares');
      suggestedActions.push('Activar chat proactivo');
    } else if (totalScore > 50) {
      suggestedActions.push('Sugerir Complete Your Look');
      suggestedActions.push('Mostrar reviews positivos');
      suggestedActions.push('Destacar envío gratis');
    } else if (totalScore > 30) {
      suggestedActions.push('Activar AI Shopper');
      suggestedActions.push('Mostrar productos trending');
      suggestedActions.push('Ofrecer guía de compra');
    } else {
      suggestedActions.push('Mostrar experiencias únicas');
      suggestedActions.push('Activar welcome modal');
      suggestedActions.push('Sugerir Style Quiz');
    }

    // Estimate time to conversion
    const timeToConversion = totalScore > 70 ? 5 : totalScore > 50 ? 15 : totalScore > 30 ? 30 : 60;
    return {
      score: Math.round(totalScore),
      confidence,
      factors,
      suggestedActions,
      timeToConversion
    };
  }

  // Predict product recommendations
  predictProductRecommendations(currentProductId?: string, limit: number = 5): ProductRecommendation[] {
    const behavior = analyticsManager.getUserBehavior();
    const recommendations: ProductRecommendation[] = [];

    // Get viewed products
    const viewedProducts = behavior.journey.filter(j => j.page.includes('/product/')).map(j => j.page.split('/product/')[1]).filter(Boolean);

    // Get search history
    const searches = behavior.interactions.filter(i => i.type === 'search').map(i => i.metadata?.query as string).filter(Boolean);

    // Trending products (simulated)
    if (recommendations.length < limit) {
      recommendations.push({
        productId: 'trending-1',
        score: 95,
        reason: 'Producto más vendido esta semana',
        category: 'trending',
        confidence: 0.9
      });
    }

    // Personalized based on views
    if (viewedProducts.length > 0 && recommendations.length < limit) {
      recommendations.push({
        productId: 'personalized-1',
        score: 88,
        reason: 'Basado en tus productos vistos',
        category: 'personalized',
        confidence: 0.85
      });
    }

    // Complementary products
    if (currentProductId && recommendations.length < limit) {
      recommendations.push({
        productId: 'complementary-1',
        score: 82,
        reason: 'Combina perfectamente con tu selección',
        category: 'complementary',
        confidence: 0.8
      });
    }

    // Similar products
    if (viewedProducts.length > 1 && recommendations.length < limit) {
      recommendations.push({
        productId: 'similar-1',
        score: 75,
        reason: 'Clientes similares también compraron',
        category: 'similar',
        confidence: 0.75
      });
    }

    // Based on searches
    if (searches.length > 0 && recommendations.length < limit) {
      recommendations.push({
        productId: 'search-based-1',
        score: 70,
        reason: `Relacionado con "${searches[0]}"`,
        category: 'personalized',
        confidence: 0.7
      });
    }
    return recommendations.slice(0, limit);
  }

  // Segment user based on behavior
  segmentUser(): UserSegment {
    const behavior = analyticsManager.getUserBehavior();
    const intent = this.predictPurchaseIntent();

    // Calculate engagement level
    const engagementScore = behavior.pagesVisited * 10 + behavior.timeOnSite / 60000 * 5 + behavior.interactions.length * 2;
    const engagementLevel: 'low' | 'medium' | 'high' | 'very_high' = engagementScore > 200 ? 'very_high' : engagementScore > 100 ? 'high' : engagementScore > 50 ? 'medium' : 'low';

    // Predict LTV (Lifetime Value)
    const predictedLTV = intent.score * 5 +
    // Intent contributes
    engagementScore * 2 +
    // Engagement contributes
    behavior.pagesVisited * 10; // Exploration contributes

    // Calculate churn risk
    const churnRisk = 100 - intent.score;

    // Determine segment characteristics
    const characteristics: string[] = [];
    if (intent.score > 70) characteristics.push('Alto potencial de compra');
    if (engagementLevel === 'very_high') characteristics.push('Usuario muy comprometido');
    if (behavior.journey.some(j => j.page.includes('/ai-shopper'))) {
      characteristics.push('Usuario de IA');
    }
    if (behavior.journey.some(j => j.page.includes('/style-dna'))) {
      characteristics.push('Interesado en personalización');
    }
    if (behavior.pagesVisited > 10) characteristics.push('Explorador activo');
    if (churnRisk < 30) characteristics.push('Baja probabilidad de abandono');

    // Determine segment name
    let segmentName = 'Visitante Casual';
    if (intent.score > 80 && engagementLevel === 'very_high') {
      segmentName = 'Comprador VIP';
    } else if (intent.score > 60) {
      segmentName = 'Comprador Potencial';
    } else if (engagementLevel === 'high' || engagementLevel === 'very_high') {
      segmentName = 'Explorador Comprometido';
    } else if (behavior.pagesVisited > 5) {
      segmentName = 'Visitante Interesado';
    }
    return {
      id: `segment_${Date.now()}`,
      name: segmentName,
      characteristics,
      predictedLTV: Math.round(predictedLTV),
      churnRisk: Math.round(churnRisk),
      engagementLevel
    };
  }

  // Predict optimal discount percentage
  predictOptimalDiscount(): number {
    const intent = this.predictPurchaseIntent();

    // Higher intent = lower discount needed
    if (intent.score > 80) return 5;
    if (intent.score > 60) return 10;
    if (intent.score > 40) return 15;
    if (intent.score > 20) return 20;
    return 25;
  }

  // Predict best time to show offer
  predictBestOfferTiming(): {
    shouldShowNow: boolean;
    waitMinutes: number;
  } {
    const behavior = analyticsManager.getUserBehavior();
    const timeOnSiteMinutes = behavior.timeOnSite / 60000;

    // Show offer after 3 minutes if high intent
    const intent = this.predictPurchaseIntent();
    if (intent.score > 70 && timeOnSiteMinutes > 3) {
      return {
        shouldShowNow: true,
        waitMinutes: 0
      };
    }
    if (intent.score > 50 && timeOnSiteMinutes > 5) {
      return {
        shouldShowNow: true,
        waitMinutes: 0
      };
    }

    // Calculate optimal wait time
    const waitMinutes = Math.max(0, 5 - timeOnSiteMinutes);
    return {
      shouldShowNow: false,
      waitMinutes: Math.round(waitMinutes)
    };
  }

  // A/B Test variant selection (simulated ML-based)
  selectABTestVariant(testName: string): 'A' | 'B' {
    const segment = this.segmentUser();

    // Use segment characteristics to select variant
    // High-value users get variant B (premium experience)
    if (segment.predictedLTV > 500 || segment.engagementLevel === 'very_high') {
      return 'B';
    }

    // Default to A for others
    return 'A';
  }
}

// --- Exports ---

export const mlEngine = MLPredictionEngine.getInstance();

// Helper functions
export const getPurchaseIntent = () => mlEngine.predictPurchaseIntent();
export const getProductRecommendations = (productId?: string, limit?: number) => mlEngine.predictProductRecommendations(productId, limit);
export const getUserSegment = () => mlEngine.segmentUser();
export const getOptimalDiscount = () => mlEngine.predictOptimalDiscount();
export const getBestOfferTiming = () => mlEngine.predictBestOfferTiming();
export const getABTestVariant = (testName: string) => mlEngine.selectABTestVariant(testName);