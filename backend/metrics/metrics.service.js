// ============================================
// Metrics Service
// ============================================
// Métricas básicas en memoria (sin infraestructura extra)

class MetricsService {
  constructor() {
    // Resetear métricas cada hora
    this.resetInterval = 60 * 60 * 1000; // 1 hora
    this.resetMetrics();
    setInterval(() => this.resetMetrics(), this.resetInterval);
  }

  /**
   * Resetear todas las métricas
   */
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        byMethod: {},
        byEndpoint: {},
        byStatus: {},
        byApiVersion: {}
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {}
      },
      payments: {
        total: 0,
        succeeded: 0,
        failed: 0,
        byStatus: {}
      },
      responseTime: {
        total: 0,
        count: 0,
        byEndpoint: {}
      },
      users: {
        logins: 0,
        registrations: 0
      },
      admin: {
        actions: 0,
        byAction: {}
      },
      startTime: new Date().toISOString(),
      cache: {
        hits: 0,
        misses: 0,
        evictions: 0,
        hitRatio: '0%'
      },
      rateLimit: {
        allowed: 0,
        exceeded: 0,
        byEndpoint: {},
        byMethod: {}
      }
    };
  }

  /**
   * Registrar cache hit
   */
  recordCacheHit() {
    if (!this.metrics.cache) {
      this.metrics.cache = { hits: 0, misses: 0, evictions: 0 };
    }
    this.metrics.cache.hits++;
  }

  /**
   * Registrar cache miss
   */
  recordCacheMiss() {
    if (!this.metrics.cache) {
      this.metrics.cache = { hits: 0, misses: 0, evictions: 0 };
    }
    this.metrics.cache.misses++;
  }

  /**
   * Registrar cache eviction
   */
  recordCacheEviction() {
    if (!this.metrics.cache) {
      this.metrics.cache = { hits: 0, misses: 0, evictions: 0 };
    }
    this.metrics.cache.evictions++;
  }

  /**
   * Registrar request
   */
  recordRequest(method, endpoint, statusCode, duration, apiVersion = 1) {
    this.metrics.requests.total++;
    
    // Por método
    this.metrics.requests.byMethod[method] = 
      (this.metrics.requests.byMethod[method] || 0) + 1;
    
    // Por endpoint
    this.metrics.requests.byEndpoint[endpoint] = 
      (this.metrics.requests.byEndpoint[endpoint] || 0) + 1;
    
    // Por status
    this.metrics.requests.byStatus[statusCode] = 
      (this.metrics.requests.byStatus[statusCode] || 0) + 1;
    
    // Por versión de API
    this.metrics.requests.byApiVersion[apiVersion] = 
      (this.metrics.requests.byApiVersion[apiVersion] || 0) + 1;
    
    // Tiempo de respuesta
    this.metrics.responseTime.total += duration;
    this.metrics.responseTime.count++;
    
    if (!this.metrics.responseTime.byEndpoint[endpoint]) {
      this.metrics.responseTime.byEndpoint[endpoint] = {
        total: 0,
        count: 0
      };
    }
    this.metrics.responseTime.byEndpoint[endpoint].total += duration;
    this.metrics.responseTime.byEndpoint[endpoint].count++;
  }

  /**
   * Registrar error
   */
  recordError(errorType, endpoint) {
    this.metrics.errors.total++;
    this.metrics.errors.byType[errorType] = 
      (this.metrics.errors.byType[errorType] || 0) + 1;
    this.metrics.errors.byEndpoint[endpoint] = 
      (this.metrics.errors.byEndpoint[endpoint] || 0) + 1;
  }

  /**
   * Registrar pago
   */
  recordPayment(status, amount = null) {
    this.metrics.payments.total++;
    
    if (status === 'succeeded') {
      this.metrics.payments.succeeded++;
    } else if (status === 'failed') {
      this.metrics.payments.failed++;
    }
    
    this.metrics.payments.byStatus[status] = 
      (this.metrics.payments.byStatus[status] || 0) + 1;
  }

  /**
   * Registrar login
   */
  recordLogin() {
    this.metrics.users.logins++;
  }

  /**
   * Registrar registro
   */
  recordRegistration() {
    this.metrics.users.registrations++;
  }

  /**
   * Registrar acción admin
   */
  recordAdminAction(action) {
    this.metrics.admin.actions++;
    this.metrics.admin.byAction[action] = 
      (this.metrics.admin.byAction[action] || 0) + 1;
  }

  /**
   * Registrar rate limit permitido
   */
  recordRateLimitAllowed(endpoint, method) {
    if (!this.metrics.rateLimit) {
      this.metrics.rateLimit = {
        allowed: 0,
        exceeded: 0,
        byEndpoint: {},
        byMethod: {}
      };
    }
    this.metrics.rateLimit.allowed++;
    this.metrics.rateLimit.byEndpoint[endpoint] = 
      (this.metrics.rateLimit.byEndpoint[endpoint] || 0) + 1;
    this.metrics.rateLimit.byMethod[method] = 
      (this.metrics.rateLimit.byMethod[method] || 0) + 1;
  }

  /**
   * Registrar rate limit excedido
   */
  recordRateLimitExceeded(endpoint, method) {
    if (!this.metrics.rateLimit) {
      this.metrics.rateLimit = {
        allowed: 0,
        exceeded: 0,
        byEndpoint: {},
        byMethod: {}
      };
    }
    this.metrics.rateLimit.exceeded++;
    this.metrics.rateLimit.byEndpoint[endpoint] = 
      (this.metrics.rateLimit.byEndpoint[endpoint] || 0) + 1;
    this.metrics.rateLimit.byMethod[method] = 
      (this.metrics.rateLimit.byMethod[method] || 0) + 1;
  }

  /**
   * Obtener métricas
   */
  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.count > 0
      ? Math.round(this.metrics.responseTime.total / this.metrics.responseTime.count)
      : 0;

    const avgByEndpoint = {};
    for (const endpoint in this.metrics.responseTime.byEndpoint) {
      const data = this.metrics.responseTime.byEndpoint[endpoint];
      avgByEndpoint[endpoint] = data.count > 0
        ? Math.round(data.total / data.count)
        : 0;
    }

    return {
      ...this.metrics,
      responseTime: {
        ...this.metrics.responseTime,
        average: avgResponseTime,
        averageByEndpoint: avgByEndpoint
      },
      uptime: Date.now() - new Date(this.metrics.startTime).getTime()
    };
  }
}

// Singleton
const metricsService = new MetricsService();

module.exports = metricsService;

