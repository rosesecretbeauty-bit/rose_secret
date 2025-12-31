// ============================================
// Rose Secret Backend - Entry Point
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./db');
const { info, error: logError } = require('./logger');
const redis = require('./cache/redis');

// ============================================
// Validar Variables de Entorno Críticas
// ============================================
if (!process.env.JWT_SECRET) {
  logError('❌ JWT_SECRET no está definido en las variables de entorno');
  console.error('\n🔧 SOLUCIÓN:');
  console.error('1. Crea un archivo .env en la carpeta backend/');
  console.error('2. Copia el contenido de env.example.txt');
  console.error('3. Genera un JWT_SECRET seguro:');
  console.error('   node -e "const crypto = require(\'crypto\'); console.log(crypto.randomBytes(32).toString(\'base64\'));"');
  console.error('4. Agrega JWT_SECRET=tu_secreto_generado al archivo .env\n');
  process.exit(1);
}

// Importar middleware
const requestContext = require('./middleware/requestContext');
const { apiVersion, apiVersionHeaders, validateApiVersion } = require('./middleware/apiVersion');
const requestLogger = require('./middleware/requestLogger');

// Verificar que los middlewares se cargaron correctamente
if (!requestContext || typeof requestContext !== 'function') {
  throw new Error('requestContext middleware no se cargó correctamente');
}
if (!apiVersion || typeof apiVersion !== 'function') {
  throw new Error('apiVersion middleware no se cargó correctamente');
}
if (!requestLogger || typeof requestLogger !== 'function') {
  throw new Error('requestLogger middleware no se cargó correctamente');
}

// ============================================
// Inicializar Redis (si está configurado)
// ============================================
redis.initializeRedis().catch(err => {
  logError('Error initializing Redis (will use in-memory fallback):', err);
});

// Importar rutas versionadas
const v1Routes = require('./routes/v1/index');
const v2Routes = require('./routes/v2/index');

// Importar rutas sin versionar (para compatibilidad y webhooks)
const webhookRoutes = require('./routes/webhook.routes');

// Crear app Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware de Seguridad
// ============================================

// Helmet - Headers de seguridad avanzados
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: [
        "'self'",
        "https://js.stripe.com", // Stripe.js
        "https://checkout.stripe.com" // Stripe Checkout
      ],
      imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://api.stripe.com", // Stripe API
        FRONTEND_URL
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com", // Stripe iframes
        "https://hooks.stripe.com"
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null, // Solo en producción
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny' // Prevenir clickjacking
  },
  noSniff: true, // Prevenir MIME type sniffing
  xssFilter: true, // XSS protection
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  crossOriginEmbedderPolicy: false, // Permitir recursos externos
  crossOriginResourcePolicy: {
    policy: "cross-origin" // Permitir recursos cross-origin
  }
}));

// CORS estricto
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [FRONTEND_URL];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc.) solo en desarrollo
    if (!origin && !isProduction) {
      return callback(null, true);
    }
    
    // Verificar si el origin está permitido
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-session-id', 'X-Session-Id'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page', 'X-Session-Id'],
  maxAge: 86400 // 24 horas
}));

// Rate limiting se aplica por ruta específica (ver rutas individuales)
// NO aplicar rate limiting global aquí para evitar conflictos con rate limiters específicos

// ============================================
// Observabilidad y Seguridad - Orden CRÍTICO
// ============================================

// 1. Request Context (Correlation ID) - PRIMERO
app.use(requestContext);

// 2. Security Headers - Temprano
const securityHeaders = require('./middleware/securityHeaders');
app.use(securityHeaders);

// 3. API Version - Después de context
app.use('/api', apiVersion);
app.use('/api', apiVersionHeaders);
app.use('/api', validateApiVersion);

// 4. IP Reputation Check - Antes de rate limiting
const { ipReputationCheck } = require('./security/ipReputation');
app.use(ipReputationCheck);

// 5. Abuse Detection - Antes de rate limiting
const { abuseDetector } = require('./security/abuseDetector');
app.use(abuseDetector);

// 6. Request Logger - Después de context y version
app.use(requestLogger);

// 7. Enumeration Protection - Antes de rutas
const enumerationProtection = require('./middleware/enumerationProtection');
app.use(enumerationProtection);

// Critical Logger Middleware (logs separados para rutas críticas)
const criticalLogger = require('./middleware/criticalLogger');
app.use(criticalLogger);

// ============================================
// Rutas
// ============================================

// ============================================
// Health & Readiness Endpoints
// ============================================
const healthRoutes = require('./routes/health.routes');
app.use('/api', healthRoutes);

// Prometheus Metrics Endpoint (FASE 4)
// ============================================
const prometheusMetricsRoutes = require('./routes/metrics.routes');
app.use('/api/metrics', prometheusMetricsRoutes);

// Swagger API Documentation (FASE 5)
// ============================================
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
  const swaggerRoutes = require('./routes/swagger.routes');
  app.use('/api-docs', swaggerRoutes);
}

// Webhook routes (ANTES de body parser para recibir raw body)
// Webhooks NO se versionan (son especiales y vienen de Stripe)
app.use('/api/webhooks', webhookRoutes);

// Body parser (después de webhooks)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Sanitizer - Después de body parser
const requestSanitizer = require('./middleware/requestSanitizer');
app.use(requestSanitizer);

// ============================================
// API Versioned Routes
// ============================================

// API v1 (versión actual)
app.use('/api/v1', v1Routes);

// API v2 (preparado para futuro)
app.use('/api/v2', v2Routes);

// ============================================
// Backward Compatibility - Mantener /api/* sin versión
// ============================================
// Todas las rutas sin /v1/ redirigen a v1 para mantener compatibilidad
// Esto permite que el frontend existente siga funcionando sin cambios

// Importar rutas originales para compatibilidad
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');
const userRoutes = require('./routes/user.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const paymentRoutes = require('./routes/payment.routes');
const reconciliationRoutes = require('./routes/reconciliation.routes');
const categoriesRoutes = require('./routes/categories.routes');
const productImagesRoutes = require('./routes/product-images.routes');
const productVariantsRoutes = require('./routes/product-variants.routes');
const variantsRoutes = require('./routes/variants.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const addressesRoutes = require('./routes/addresses.routes');
const stockRoutes = require('./routes/stock.routes');
const checkoutRoutes = require('./routes/checkout.routes');

// Rutas sin versión (alias a v1 para compatibilidad)
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/reconciliation', reconciliationRoutes);
// Mount admin routes BEFORE categories routes to avoid route conflicts
// (admin routes have specific routes like /coupons that need to match before /:id)
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);
app.use('/api/admin', categoriesRoutes); // Admin categories routes (after admin routes)
app.use('/api', productImagesRoutes); // Product images routes (admin) - Legacy (acepta URLs)
const imagesRoutes = require('./routes/images.routes');
app.use('/api/images', imagesRoutes); // Nueva ruta centralizada con Cloudinary
const bannersRoutes = require('./routes/banners.routes');
app.use('/api/banners', bannersRoutes); // Rutas de banners (GET)
app.use('/api', productVariantsRoutes); // Product variants routes (admin - legacy)
app.use('/api', variantsRoutes); // Variants and attributes routes (new system)
app.use('/api', inventoryRoutes); // Inventory routes
app.use('/api', reviewsRoutes); // Reviews routes
app.use('/api', stockRoutes); // Stock validation routes
app.use('/api', checkoutRoutes); // Checkout routes
app.use('/api/user/addresses', addressesRoutes); // User addresses routes
const loyaltyRoutes = require('./routes/loyalty.routes');
app.use('/api/user/loyalty', loyaltyRoutes); // User loyalty routes
const insightsRoutes = require('./routes/insights.routes');
app.use('/api/user/insights', insightsRoutes); // User insights routes
const waitlistRoutes = require('./routes/waitlist.routes');
app.use('/api/user/waitlist', waitlistRoutes); // User waitlist routes
const paymentMethodsRoutes = require('./routes/paymentMethods.routes');
app.use('/api/user/payment-methods', paymentMethodsRoutes); // User payment methods routes
const adminMetricsRoutes = require('./routes/admin/metrics.routes');
app.use('/api/admin/metrics', adminMetricsRoutes);
const auditRoutes = require('./routes/admin/audit.routes');
app.use('/api/admin/audit', auditRoutes);
const appConfigRoutes = require('./routes/appConfig.routes');
app.use('/api/app-config', appConfigRoutes);
const emailTemplatesRoutes = require('./routes/emailTemplates.routes');
app.use('/api/email-templates', emailTemplatesRoutes);
const emailConfigRoutes = require('./routes/emailConfig.routes');
app.use('/api/email-config', emailConfigRoutes);
const appSettingsRoutes = require('./routes/appSettings.routes');
app.use('/api/app-settings', appSettingsRoutes);
const securitySettingsRoutes = require('./routes/securitySettings.routes');
app.use('/api/security-settings', securitySettingsRoutes);
const passwordRecoveryRoutes = require('./routes/passwordRecovery.routes');
app.use('/api/password-recovery', passwordRecoveryRoutes);
const promotionsRoutes = require('./routes/promotions.routes');
app.use('/api/promotions', promotionsRoutes);
const influencersRoutes = require('./routes/influencers.routes');
app.use('/api', influencersRoutes); // Incluye /api/influencers (público)
const socialProofRoutes = require('./routes/social-proof.routes');
app.use('/api/social-proof', socialProofRoutes);
const seoRoutes = require('./routes/seo.routes');
app.use('/api/seo', seoRoutes);

// Development routes (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  const devRoutes = require('./routes/dev.routes');
  app.use('/api/dev', devRoutes);
}

// ============================================
// Manejo de Errores
// ============================================

// 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Error handler centralizado
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// ============================================
// Iniciar Servidor
// ============================================

async function startServer() {
  // Probar conexión a BD
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    logError('No se pudo conectar a la base de datos. El servidor no se iniciará.');
    process.exit(1);
  }

  // Iniciar servidor
  const server = app.listen(PORT, '0.0.0.0', async () => {
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const isProduction = NODE_ENV === 'production';
    
    // Verificar estado de Redis
    const redisStatus = redis.getStatus();
    if (redisStatus.enabled) {
      info(`📦 Redis: ${redisStatus.available ? '✅ Conectado (cache distribuido activo)' : '⚠️ No disponible (usando fallback in-memory)'}`);
    }
    
    if (isProduction) {
      info('===========================================');
      info('🌹 Rose Secret Backend - PRODUCTION');
      info('===========================================');
      info(`✅ Servidor corriendo en http://0.0.0.0:${PORT} en modo ${NODE_ENV}`);
      info(`✅ Frontend URL: ${process.env.FRONTEND_URL || 'NO CONFIGURADO'}`);
      info('===========================================');
    } else {
      info('===========================================');
      info('🌹 Rose Secret Backend - MVP');
      info('===========================================');
      info(`✅ Servidor corriendo en http://0.0.0.0:${PORT} en modo ${NODE_ENV}`);
      info(`✅ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      info('===========================================');
      info(`📡 API disponible en: http://localhost:${PORT}/api`);
      info(`🏥 Health check: http://localhost:${PORT}/api/health`);
      info('===========================================');
    }
  });

  // Graceful shutdown handlers
  const gracefulShutdown = async (signal) => {
    info(`${signal} received, shutting down gracefully...`);
    
    // Cerrar servidor (no aceptar nuevas conexiones)
    server.close(() => {
      info('HTTP server closed');
    });
    
    // Cerrar Redis
    await redis.close();
    
    // Cerrar pool de DB
    const { closePool } = require('./db');
    await closePool();
    
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
}

startServer();

