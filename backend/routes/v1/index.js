// ============================================
// API v1 Routes - Main Router
// ============================================
// Todas las rutas de la versión 1 de la API

const express = require('express');
const router = express.Router();

// Importar todas las rutas v1
const authRoutes = require('./auth.routes');
const productsRoutes = require('./products.routes');
const categoriesRoutes = require('./categories.routes');
const cartRoutes = require('./cart.routes');
const ordersRoutes = require('./orders.routes');
const paymentRoutes = require('./payment.routes');
const userRoutes = require('./user.routes');
const wishlistRoutes = require('./wishlist.routes');
const webhookRoutes = require('./webhook.routes');
const reconciliationRoutes = require('./reconciliation.routes');
const discountsRoutes = require('../discounts.routes');
const notificationsRoutes = require('../notifications.routes');
const permissionsRoutes = require('../permissions.routes');
const metricsRoutes = require('../admin/metrics.routes');
const auditRoutes = require('../admin/audit.routes');
const appConfigRoutes = require('../appConfig.routes');
const promotionsRoutes = require('../promotions.routes');
const influencersRoutes = require('../influencers.routes');
const socialProofRoutes = require('../social-proof.routes');
const seoRoutes = require('../seo.routes');

// ============================================
// Rutas Públicas
// ============================================

// Auth routes
router.use('/auth', authRoutes);

// Products routes (público)
router.use('/products', productsRoutes);

// Categories routes (público y admin)
router.use('/', categoriesRoutes);

// Influencers routes (público)
router.use('/influencers', influencersRoutes);

// Social Proof routes (público)
router.use('/social-proof', socialProofRoutes);

// SEO routes (público y admin)
router.use('/seo', seoRoutes);

// ============================================
// Rutas Protegidas (requieren autenticación)
// ============================================

// Cart routes
router.use('/cart', cartRoutes);

// Wishlist routes
router.use('/wishlist', wishlistRoutes);

// Orders routes
router.use('/orders', ordersRoutes);

// Payment routes
router.use('/payments', paymentRoutes);

// Discounts routes (público y autenticado)
router.use('/discounts', discountsRoutes);

// Notifications routes (requieren autenticación)
router.use('/notifications', notificationsRoutes);

// Permissions routes (requieren autenticación)
router.use('/permissions', permissionsRoutes);

// Admin routes (requieren autenticación + permisos)
const adminRoutes = require('../admin.routes');
router.use('/admin', adminRoutes);

// User routes
router.use('/user', userRoutes);

// ============================================
// Rutas de Webhooks (sin autenticación, pero con verificación)
// ============================================

router.use('/webhooks', webhookRoutes);

// ============================================
// Rutas Admin (requieren autenticación + rol admin)
// ============================================

// Admin products
router.use('/admin/products', productsRoutes);

// Admin orders
router.use('/admin/orders', ordersRoutes);

// Admin reconciliation
router.use('/admin/reconciliation', reconciliationRoutes);

// Admin metrics
router.use('/admin/metrics', metricsRoutes);

// Admin audit
router.use('/admin/audit', auditRoutes);

// Admin product images
const productImagesRoutes = require('../product-images.routes');
router.use('/', productImagesRoutes);

// Admin product variants
const productVariantsRoutes = require('../product-variants.routes');
router.use('/', productVariantsRoutes);

module.exports = router;

