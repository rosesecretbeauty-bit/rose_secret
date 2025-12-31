// ============================================
// Development Routes - Solo en desarrollo
// ============================================
// Rutas de utilidad para desarrollo y testing
// NUNCA deben estar disponibles en producción

const express = require('express');
const router = express.Router();
const { blockKey, isBlocked, generateKey, blockedKeys, requestCounts } = require('../security/rateLimiter');
const redis = require('../cache/redis');

// Middleware: Solo permitir en desarrollo
const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      message: 'Not found'
    });
  }
  next();
};

// ============================================
// POST /api/dev/rate-limit/clear
// ============================================
// Limpiar todos los bloqueos de rate limiting
router.post('/rate-limit/clear', devOnly, async (req, res) => {
  try {
    const { ip, key } = req.body;
    
    let cleared = 0;
    
    if (key) {
      // Limpiar clave específica
      blockedKeys.delete(key);
      requestCounts.delete(key);
      
      // Limpiar en Redis si está disponible
      if (redis.getStatus().enabled) {
        const redisClient = redis.getClient();
        if (redisClient) {
          await redisClient.del(`ratelimit:block:${key}`);
          await redisClient.del(`ratelimit:${key}`);
        }
      }
      
      cleared = 1;
    } else if (ip) {
      // Limpiar todas las claves que contengan esta IP
      const ipPattern = `rate:ip:${ip}`;
      const combinedPattern = `rate:combined:${ip}`;
      
      for (const [key] of blockedKeys.entries()) {
        if (key.includes(ipPattern) || key.includes(combinedPattern)) {
          blockedKeys.delete(key);
          requestCounts.delete(key);
          cleared++;
        }
      }
      
      // Limpiar en Redis
      if (redis.getStatus().enabled) {
        const redisClient = redis.getClient();
        if (redisClient) {
          const keys = await redisClient.keys(`ratelimit:*${ip}*`);
          if (keys.length > 0) {
            await redisClient.del(...keys);
            cleared += keys.length;
          }
        }
      }
    } else {
      // Limpiar todos los bloqueos
      cleared = blockedKeys.size;
      blockedKeys.clear();
      requestCounts.clear();
      
      // Limpiar en Redis
      if (redis.getStatus().enabled) {
        const redisClient = redis.getClient();
        if (redisClient) {
          const keys = await redisClient.keys('ratelimit:*');
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        }
      }
    }
    
    res.json({
      success: true,
      message: `Limpiados ${cleared} bloqueo(s) de rate limiting`,
      cleared
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al limpiar bloqueos',
      error: error.message
    });
  }
});

// ============================================
// GET /api/dev/rate-limit/status
// ============================================
// Ver estado de rate limiting para una IP
router.get('/rate-limit/status', devOnly, async (req, res) => {
  try {
    const ip = req.query.ip || req.ip;
    const ipPattern = `rate:ip:${ip}`;
    const combinedPattern = `rate:combined:${ip}`;
    
    const blocks = [];
    const counts = [];
    
    // Buscar bloqueos
    for (const [key, block] of blockedKeys.entries()) {
      if (key.includes(ipPattern) || key.includes(combinedPattern)) {
        const now = Date.now();
        const elapsed = now - block.blockedAt;
        const remaining = Math.max(0, block.blockDuration - elapsed);
        
        blocks.push({
          key,
          blockedAt: new Date(block.blockedAt).toISOString(),
          blockDuration: block.blockDuration,
          remaining: Math.ceil(remaining / 1000),
          isActive: remaining > 0
        });
      }
    }
    
    // Buscar contadores
    for (const [key, data] of requestCounts.entries()) {
      if (key.includes(ipPattern) || key.includes(combinedPattern)) {
        const now = Date.now();
        const elapsed = now - data.windowStart;
        const remaining = Math.max(0, data.windowMs - elapsed);
        
        counts.push({
          key,
          count: data.count,
          windowStart: new Date(data.windowStart).toISOString(),
          windowMs: data.windowMs,
          remaining: Math.ceil(remaining / 1000)
        });
      }
    }
    
    res.json({
      success: true,
      ip,
      blocks,
      counts,
      totalBlocks: blocks.length,
      totalCounts: counts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado',
      error: error.message
    });
  }
});

module.exports = router;

