// ============================================
// Health & Readiness Routes
// ============================================

const express = require('express');
const router = express.Router();
const { testConnection } = require('../db');
const cacheManager = require('../cache'); // Auto-selecciona Redis si está disponible
const redis = require('../cache/redis'); // FASE 3: Estado de Redis
const { rateLimiters, getBruteForceStats } = require('../security/rateLimiter');
const { info, error: logError } = require('../logger');

// ============================================
// GET /api/health
// ============================================
// ❌ NO CACHEABLE: Health check, siempre debe devolver estado actual
// 🔒 RATE LIMITED: Interno (1000 req/min por IP - muy permisivo)
// No usar cacheMiddleware aquí
router.get('/health', rateLimiters.internal, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Verificar conexión a base de datos
    const dbStatus = await testConnection();
    const totalResponseTime = Date.now() - startTime;
    
    const health = {
      status: dbStatus.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbStatus.connected,
        type: dbStatus.type,
        responseTime: `${dbStatus.responseTime}ms`,
        ...(dbStatus.error && { error: dbStatus.error })
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        unit: 'MB'
      },
      responseTime: `${totalResponseTime}ms`,
      version: process.env.npm_package_version || '1.0.0'
    };

    // Si la DB no está conectada, marcar como unhealthy
    if (!dbStatus.connected) {
      return res.status(503).json(health);
    }

    res.json(health);
  } catch (error) {
    logError('Error in /health endpoint:', error, { requestId: req.requestId });
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false
      }
    };
    res.status(503).json(health);
  }
});

// ============================================
// GET /api/ready
// ============================================
// ❌ NO CACHEABLE: Readiness check, siempre debe devolver estado actual
// 🔒 RATE LIMITED: Interno (1000 req/min por IP - muy permisivo)
// No usar cacheMiddleware aquí
router.get('/ready', rateLimiters.internal, async (req, res) => {
  const startTime = Date.now();
  const checks = {
    database: { status: 'unknown', responseTime: null },
    cache: { status: 'unknown' },
    logger: { status: 'unknown' },
    rateLimiter: { status: 'unknown' }
  };
  
  let allHealthy = true;
  
  try {
    // 1. Verificar base de datos
    try {
      const dbStart = Date.now();
      const dbStatus = await testConnection();
      const dbResponseTime = Date.now() - dbStart;
      
      checks.database = {
        status: dbStatus.connected ? 'healthy' : 'unhealthy',
        type: dbStatus.type,
        responseTime: `${dbResponseTime}ms`,
        ...(dbStatus.error && { error: dbStatus.error })
      };
      
      if (!dbStatus.connected) {
        allHealthy = false;
      }
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        error: error.message
      };
      allHealthy = false;
    }
    
    // 2. Verificar cache
    try {
      const cacheHealthy = cacheManager.isHealthy();
      const cacheStats = await cacheManager.getStats();
      const redisStatus = redis.getStatus(); // FASE 3: Estado de Redis
      
      checks.cache = {
        status: cacheHealthy ? 'healthy' : 'degraded',
        strategy: cacheStats.strategy || 'memory-only',
        redis: redisStatus.available ? 'connected' : (redisStatus.enabled ? 'unavailable' : 'disabled'),
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
        utilization: cacheStats.utilization,
        hitRatio: cacheStats.hitRatio
      };
      
      if (!cacheHealthy) {
        // Cache casi lleno, pero no crítico
        allHealthy = allHealthy && true; // No falla readiness
      }
    } catch (error) {
      checks.cache = {
        status: 'unhealthy',
        error: error.message
      };
      allHealthy = false;
    }
    
    // 3. Verificar logger
    try {
      info('Readiness check - logger test');
      checks.logger = {
        status: 'healthy'
      };
    } catch (error) {
      checks.logger = {
        status: 'unhealthy',
        error: error.message
      };
      allHealthy = false;
    }
    
    // 4. Verificar rate limiter
    try {
      const bruteForceStats = getBruteForceStats();
      checks.rateLimiter = {
        status: 'healthy',
        details: {
          blockedIPs: bruteForceStats.blockedIPs.length,
          failedAttempts: bruteForceStats.failedAttempts.length
        }
      };
    } catch (error) {
      checks.rateLimiter = {
        status: 'unhealthy',
        error: error.message
      };
      allHealthy = false;
    }
    
    const totalResponseTime = Date.now() - startTime;
    
    const readiness = {
      status: allHealthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
      responseTime: `${totalResponseTime}ms`,
      version: process.env.npm_package_version || '1.0.0'
    };
    
    if (!allHealthy) {
      logError('Application is not ready', { checks, requestId: req.requestId });
      return res.status(503).json(readiness);
    }

    info('Application is ready', { checks, requestId: req.requestId });
    res.json(readiness);
  } catch (error) {
    logError('Error in /ready endpoint:', error, { requestId: req.requestId });
    const readiness = {
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks
    };
    res.status(503).json(readiness);
  }
});

module.exports = router;

