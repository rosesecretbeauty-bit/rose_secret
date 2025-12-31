// ============================================
// Cache Middleware - Hardened
// ============================================
// Middleware robusto de cache para endpoints GET públicos
// Con fallback seguro, headers consistentes y validaciones

const cacheManager = require('./index'); // Auto-selecciona Redis si está disponible
const { generateETag } = require('./cacheKeys');
const { debug, warn } = require('../logger');

/**
 * Middleware de cache configurable y robusto
 * 
 * @param {Object} config - Configuración del middleware
 * @param {number} config.ttl - TTL en milisegundos
 * @param {Function} config.keyBuilder - Función para construir la key (recibe req)
 * @param {Function} config.skipCache - Función para saltar cache (recibe req, retorna boolean)
 * @param {string[]} config.vary - Headers que varían el cache (ej: ['Accept-Language'])
 * @param {boolean} config.requireAuth - Si true, requiere autenticación (NO cachea)
 * @returns {Function} Middleware de Express
 */
function cacheMiddleware(config = {}) {
  const {
    ttl = 60 * 1000, // 60 segundos por defecto
    keyBuilder = null, // Función para construir la key
    skipCache = null, // Función para saltar cache
    vary = [], // Headers que varían el cache
    requireAuth = false // Si requiere auth, NO cachea
  } = config;

  return async (req, res, next) => {
    // ============================================
    // Validaciones iniciales
    // ============================================
    
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // No cachear si está deshabilitado globalmente
    if (process.env.CACHE_ENABLED === 'false') {
      if (process.env.NODE_ENV === 'development') {
        debug('Cache bypassed: CACHE_ENABLED=false');
      }
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    // No cachear si requiere autenticación y el usuario está autenticado
    // (datos personalizados no deben compartirse)
    if (req.user || req.headers.authorization) {
      if (process.env.NODE_ENV === 'development') {
        debug('Cache bypassed: authenticated request');
      }
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    // No cachear si hay query param nocache (debugging)
    if (req.query.nocache === 'true') {
      if (process.env.NODE_ENV === 'development') {
        debug('Cache bypassed: nocache=true query param');
      }
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    // Verificar función skipCache personalizada
    if (skipCache && typeof skipCache === 'function' && skipCache(req)) {
      if (process.env.NODE_ENV === 'development') {
        debug('Cache bypassed: skipCache function returned true');
      }
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    // ============================================
    // Construir key de cache
    // ============================================
    
    let cacheKey;
    try {
      if (keyBuilder && typeof keyBuilder === 'function') {
        cacheKey = keyBuilder(req);
      } else {
        // Key por defecto: método + path + query + vary headers + apiVersion
        const queryStr = Object.keys(req.query)
          .sort()
          .map(k => `${k}=${String(req.query[k]).replace(/:/g, '_')}`)
          .join('&');
        const varyStr = vary
          .map(h => req.headers[h.toLowerCase()] || '')
          .filter(v => v)
          .join('|');
        cacheKey = `${req.method}:${req.path}:${queryStr || 'no-query'}:${varyStr || 'no-vary'}:v${req.apiVersion || 1}`;
      }
      
      if (!cacheKey || cacheKey.length === 0) {
        throw new Error('Empty cache key generated');
      }
    } catch (error) {
      // Fallback seguro: si falla la construcción de key, no cachear
      warn('Cache key generation failed, bypassing cache', { error: error.message, path: req.path });
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    // ============================================
    // Intentar obtener del cache
    // ============================================
    
    try {
      const cached = await cacheManager.get(cacheKey);
      
      if (cached !== null) {
        // Cache HIT
        if (process.env.NODE_ENV === 'development') {
          debug(`Cache HIT: ${cacheKey}`);
        }
        
        // Validar que los datos cacheados sean válidos
        if (typeof cached !== 'object' || cached === null) {
          warn(`Invalid cached data for ${cacheKey}, bypassing cache`);
          res.setHeader('X-Cache', 'BYPASS');
          return next();
        }
        
        // Generar ETag
        const etag = generateETag(cacheKey, cached);
        
        // Verificar If-None-Match (304 Not Modified)
        if (req.headers['if-none-match'] === etag) {
          res.status(304);
          res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}`);
          res.setHeader('ETag', etag);
          res.setHeader('X-Cache', 'HIT');
          if (vary.length > 0) {
            res.setHeader('Vary', vary.join(', '));
          }
          return res.end();
        }
        
        // Agregar headers de cache consistentes
        res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}`);
        res.setHeader('ETag', etag);
        res.setHeader('X-Cache', 'HIT');
        if (vary.length > 0) {
          res.setHeader('Vary', vary.join(', '));
        }
        
        // Retornar datos cacheados
        return res.json(cached);
      }
    } catch (error) {
      // Fallback seguro: si falla el get, continuar sin cache
      warn('Cache get failed, continuing without cache', { error: error.message, key: cacheKey });
      res.setHeader('X-Cache', 'BYPASS');
      // Continuar al handler normal
    }

    // ============================================
    // Cache MISS - Interceptar respuesta
    // ============================================
    
    if (process.env.NODE_ENV === 'development') {
      debug(`Cache MISS: ${cacheKey}`);
    }
    
    // Guardar funciones originales
    const originalJson = res.json;
    const originalSend = res.send;
    const originalEnd = res.end;
    
    // Variables para capturar respuesta
    let responseData = null;
    let responseStatus = 200;
    
    // Interceptar res.json
    res.json = function(data) {
      responseData = data;
      responseStatus = res.statusCode || 200;
      return originalJson.call(this, data);
    };
    
    // Interceptar res.send (por si acaso)
    res.send = function(data) {
      responseData = data;
      responseStatus = res.statusCode || 200;
      return originalSend.call(this, data);
    };
    
    // Interceptar res.end para agregar headers después de la respuesta
    res.end = function(...args) {
      // Solo procesar si la respuesta fue exitosa
      if (responseStatus === 200 && responseData) {
        try {
          // Validar que los datos sean cacheables
          if (typeof responseData === 'object' && responseData !== null) {
            // Solo cachear si success !== false (respuestas exitosas)
            if (responseData.success !== false) {
              // Establecer headers ANTES de enviar la respuesta
              const etag = generateETag(cacheKey, responseData);
              if (!res.getHeader('Cache-Control')) {
                res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}`);
              }
              if (!res.getHeader('ETag')) {
                res.setHeader('ETag', etag);
              }
              if (!res.getHeader('X-Cache')) {
                res.setHeader('X-Cache', 'MISS');
              }
              if (vary.length > 0 && !res.getHeader('Vary')) {
                res.setHeader('Vary', vary.join(', '));
              }
              
              // Intentar cachear de forma asíncrona (no bloquea la respuesta)
              // Usar .then() en lugar de await para no bloquear (res.end no puede ser async)
              cacheManager.set(cacheKey, responseData, ttl)
                .then(cached => {
                  if (!cached) {
                    // Cache falló, pero no rompe (ya establecimos headers)
                    if (process.env.NODE_ENV === 'development') {
                      debug('Cache set returned false for key:', cacheKey);
                    }
                  }
                })
                .catch(error => {
                  // Fallback seguro: si falla el cache, no romper la respuesta
                  warn('Cache set failed in middleware, continuing', { error: error.message, key: cacheKey });
                });
            } else {
              // Respuesta con error, no cachear
              if (!res.getHeader('X-Cache')) {
                res.setHeader('X-Cache', 'BYPASS');
              }
            }
          }
        } catch (error) {
          // Fallback seguro: si falla el cache, no romper la respuesta
          warn('Cache set failed in middleware, continuing', { error: error.message, key: cacheKey });
          if (!res.getHeader('X-Cache')) {
            res.setHeader('X-Cache', 'BYPASS');
          }
        }
      } else {
        // Respuesta no exitosa, no cachear
        if (!res.getHeader('X-Cache')) {
          res.setHeader('X-Cache', 'BYPASS');
        }
      }
      
      return originalEnd.apply(this, args);
    };
    
    next();
  };
}

module.exports = cacheMiddleware;

