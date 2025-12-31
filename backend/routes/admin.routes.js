// ============================================
// Admin Routes
// ============================================
// Rutas administrativas con protección por permisos

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { rateLimiters } = require('../security/rateLimiter');
const { query } = require('../db');
const { error: logError } = require('../logger');
const auditService = require('../services/audit.service');
const { query: queryValidator, validationResult } = require('express-validator');

// ============================================
// GET /api/admin/dashboard/stats
// ============================================
// Estadísticas del dashboard (requiere admin)
router.get('/dashboard/stats', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Órdenes del día
    const todayOrders = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders
       WHERE DATE(created_at) = DATE(?)
       AND status != 'cancelled'`,
      [today]
    );

    // Órdenes del mes
    const monthOrders = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders
       WHERE created_at >= ?
       AND status != 'cancelled'`,
      [startOfMonth]
    );

    // Total de ingresos
    const totalRevenue = await query(
      `SELECT COALESCE(SUM(total), 0) as revenue
       FROM orders
       WHERE status != 'cancelled'`
    );

    // Órdenes por estado
    const ordersByStatus = await query(
      `SELECT status, COUNT(*) as count
       FROM orders
       GROUP BY status`
    );

    // Usuarios nuevos (hoy)
    const newUsersToday = await query(
      `SELECT COUNT(*) as count
       FROM users
       WHERE DATE(created_at) = DATE(?)`,
      [today]
    );

    // Usuarios nuevos (mes)
    const newUsersMonth = await query(
      `SELECT COUNT(*) as count
       FROM users
       WHERE created_at >= ?`,
      [startOfMonth]
    );

    // Cupones usados (hoy) - usar coupon_usage en lugar de order_discounts
    let couponsUsedToday = [{ count: 0 }];
    try {
      couponsUsedToday = await query(
        `SELECT COUNT(DISTINCT order_id) as count
         FROM coupon_usage
         WHERE DATE(used_at) = DATE(?)`,
        [today]
      );
    } catch (error) {
      // Si la tabla no existe o hay error, usar 0 como valor por defecto
      logError('Error getting coupons used today, using default value 0:', error.message);
      couponsUsedToday = [{ count: 0 }];
    }

    // Productos más vendidos (top 5)
    const topProducts = await query(
      `SELECT 
        p.id,
        p.name,
        p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as revenue
       FROM order_items oi
       INNER JOIN products p ON oi.product_id = p.id
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'
       GROUP BY p.id, p.name, p.price
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        orders: {
          today: {
            count: todayOrders[0]?.count || 0,
            revenue: parseFloat(todayOrders[0]?.revenue || 0),
          },
          month: {
            count: monthOrders[0]?.count || 0,
            revenue: parseFloat(monthOrders[0]?.revenue || 0),
          },
          total: {
            revenue: parseFloat(totalRevenue[0]?.revenue || 0),
          },
          byStatus: ordersByStatus.map(row => ({
            status: row.status,
            count: parseInt(row.count),
          })),
        },
        users: {
          newToday: parseInt(newUsersToday[0]?.count || 0),
          newMonth: parseInt(newUsersMonth[0]?.count || 0),
        },
        coupons: {
          usedToday: parseInt(couponsUsedToday[0]?.count || 0),
        },
        topProducts: topProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: parseFloat(p.price),
          totalSold: parseInt(p.total_sold),
          revenue: parseFloat(p.revenue),
        })),
      },
    });
  } catch (error) {
    logError('Error getting dashboard stats:', error);
    // Log detailed error information
    console.error('Dashboard stats error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET /api/admin/orders
// ============================================
// Listar todas las órdenes (requiere orders.read)
router.get('/orders', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;

    let sql = `
      SELECT 
        o.id,
        o.order_number,
        o.user_id,
        u.name as customer_name,
        u.email as customer_email,
        o.status,
        o.payment_status,
        o.total,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (o.order_number LIKE ? OR u.email LIKE ? OR u.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = await query(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(DISTINCT o.id) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1';
    const countParams = [];
    if (status) {
      countSql += ' AND o.status = ?';
      countParams.push(status);
    }
    if (search) {
      countSql += ' AND (o.order_number LIKE ? OR u.email LIKE ? OR u.name LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    const [countResult] = await query(countSql, countParams);

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name || 'N/A',
          customer_email: order.customer_email || 'N/A',
          status: order.status,
          payment_status: order.payment_status,
          total: parseFloat(order.total),
          item_count: parseInt(order.item_count),
          date: order.created_at,
        })),
        pagination: {
          page,
          limit,
          total: parseInt(countResult.total),
          totalPages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    logError('Error getting admin orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
    });
  }
});

// ============================================
// PUT /api/admin/orders/:id/status
// ============================================
// Actualizar estado de orden (requiere orders.update)
router.put('/orders/:id/status', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Estado requerido',
      });
    }

    // Validar estado válido
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido',
      });
    }

    // Obtener orden actual
    const [currentOrder] = await query('SELECT id, status, order_number FROM orders WHERE id = ?', [id]);

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Actualizar estado
    await query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Auditoría
    await auditService.logAudit(
      'ORDER_STATUS_UPDATED',
      'order',
      parseInt(id),
      { status: currentOrder.status },
      { status },
      req,
      {
        order_id: id,
        order_number: currentOrder.order_number,
        updated_by: req.user.id,
      }
    );

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: {
        id: parseInt(id),
        status,
      },
    });
  } catch (error) {
    logError('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
    });
  }
});

// ============================================
// GET /api/admin/audit-logs
// ============================================
// Obtener logs de auditoría (requiere audit.read)
router.get('/audit-logs', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const userId = req.query.user_id;
    const action = req.query.action;
    const entity = req.query.entity;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    const auditService = require('../services/audit.service');
    const logs = await auditService.getAuditLogs({
      userId: userId ? parseInt(userId) : undefined,
      action,
      entity,
      startDate,
      endDate,
      page,
      limit,
    });

    // Obtener usuarios para mostrar nombres
    const userIds = [...new Set(logs.map(log => log.user_id).filter(Boolean))];
    let users = [];
    if (userIds.length > 0) {
      users = await query(
        `SELECT id, name, email FROM users WHERE id IN (${userIds.map(() => '?').join(',')})`,
        userIds
      );
    }
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = u;
    });

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
    const countParams = [];
    if (userId) {
      countSql += ' AND user_id = ?';
      countParams.push(userId);
    }
    if (action) {
      countSql += ' AND action = ?';
      countParams.push(action);
    }
    if (entity) {
      countSql += ' AND entity = ?';
      countParams.push(entity);
    }
    if (startDate) {
      countSql += ' AND created_at >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countSql += ' AND created_at <= ?';
      countParams.push(endDate);
    }
    const [countResult] = await query(countSql, countParams);

    res.json({
      success: true,
      data: {
        logs: logs.map(log => ({
          id: log.id,
          user: log.user_id ? (userMap[log.user_id] || { name: 'Sistema', email: null }) : null,
          action: log.action,
          entity: log.entity,
          entity_id: log.entity_id,
          old_value: log.old_value,
          new_value: log.new_value,
          metadata: log.metadata,
          ip: log.ip,
          created_at: log.created_at,
        })),
        pagination: {
          page,
          limit,
          total: parseInt(countResult.total),
          totalPages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    logError('Error getting audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener logs de auditoría',
    });
  }
});

// ============================================
// GET /api/admin/users
// ============================================
// Listar todos los usuarios (requiere users.read)
router.get('/users', authenticate, requireAdmin, rateLimiters.api, [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Page debe ser un número entero mayor a 0'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit debe ser un número entre 1 y 100'),
  queryValidator('search').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Search debe tener entre 1 y 255 caracteres'),
  queryValidator('role').optional().trim().isLength({ min: 1 }).withMessage('Role inválido'),
  queryValidator('status').optional().isIn(['active', 'inactive']).withMessage('Status debe ser active o inactive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const role = req.query.role;
    const status = req.query.status; // 'active' o 'inactive'

    // Construir query base
    let sql = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.created_at,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN o.total ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE 1=1
    `;
    const params = [];

    // Filtro de búsqueda
    if (search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Filtro por rol
    if (role) {
      sql += ' AND u.role = ?';
      params.push(role);
    }

    sql += ' GROUP BY u.id, u.email, u.name, u.role, u.created_at ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await query(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(DISTINCT u.id) as total FROM users u WHERE 1=1';
    const countParams = [];
    if (search) {
      countSql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm);
    }
    if (role) {
      countSql += ' AND u.role = ?';
      countParams.push(role);
    }
    const [countResult] = await query(countSql, countParams);

    // Formatear respuesta
    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || 'customer',
          status: 'Activo', // Por defecto activo, se puede extender con campo is_active en BD
          orders: parseInt(user.order_count) || 0,
          spent: parseFloat(user.total_spent) || 0,
          joined: user.created_at,
        })),
        pagination: {
          page,
          limit,
          total: parseInt(countResult.total),
          totalPages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    logError('Error getting admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
    });
  }
});

// ============================================
// GET /api/admin/abandoned-carts
// ============================================
// Obtener carritos abandonados (requiere admin)
router.get('/abandoned-carts', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const recovered = req.query.recovered;

    let sql = `
      SELECT 
        ac.id,
        ac.user_id,
        ac.session_id,
        ac.email,
        ac.items,
        ac.recovered,
        ac.recovered_at,
        ac.expires_at,
        ac.created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM abandoned_carts ac
      LEFT JOIN users u ON ac.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (recovered !== undefined) {
      sql += ' AND ac.recovered = ?';
      params.push(recovered === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY ac.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const carts = await query(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM abandoned_carts WHERE 1=1';
    const countParams = [];
    if (recovered !== undefined) {
      countSql += ' AND recovered = ?';
      countParams.push(recovered === 'true' ? 1 : 0);
    }
    const [countResult] = await query(countSql, countParams);

    // Calcular totales
    const totals = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN recovered = 0 THEN 1 END) as pending,
        COUNT(CASE WHEN recovered = 1 THEN 1 END) as recovered,
        COALESCE(SUM(JSON_EXTRACT(items, '$.total')), 0) as recoverable_value
      FROM abandoned_carts
      WHERE recovered = 0
    `);

    const formattedCarts = carts.map(cart => {
      const items = JSON.parse(cart.items || '[]');
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        id: `AC-${cart.id}`,
        cart_id: cart.id,
        customer: cart.customer_name || 'Guest',
        email: cart.email || cart.customer_email,
        items: items.length,
        total: parseFloat(total.toFixed(2)),
        abandonedAt: cart.created_at,
        status: cart.recovered ? 'Recovered' : (cart.expires_at && new Date(cart.expires_at) < new Date() ? 'Lost' : 'Pending'),
        recoverySent: cart.recovered_at !== null,
      };
    });

    res.json({
      success: true,
      data: {
        carts: formattedCarts,
        stats: {
          total: parseInt(countResult.total),
          recoverable: totals[0]?.recoverable_value || 0,
          recoveryRate: countResult.total > 0 ? ((totals[0]?.recovered || 0) / countResult.total * 100).toFixed(1) : 0,
        },
        pagination: {
          page,
          limit,
          total: parseInt(countResult.total),
          totalPages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    logError('Error getting abandoned carts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener carritos abandonados',
    });
  }
});

// ============================================
// GET /api/admin/coupons
// ============================================
// Obtener todos los cupones (requiere coupons.read)
router.get('/coupons', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    // Debug logging
    logError('GET /admin/coupons - Request received', {
      query: req.query,
      user: req.user?.id
    });

    // Parse and validate query parameters manually
    const pageStr = req.query.page;
    const limitStr = req.query.limit;
    const statusStr = req.query.status;
    
    logError('GET /admin/coupons - Parsing query params', {
      pageStr,
      limitStr,
      statusStr,
      pageType: typeof pageStr,
      limitType: typeof limitStr
    });

    let page = pageStr !== undefined ? parseInt(String(pageStr), 10) : NaN;
    let limit = limitStr !== undefined ? parseInt(String(limitStr), 10) : NaN;
    const status = statusStr ? String(statusStr).trim() : undefined;

    logError('GET /admin/coupons - Parsed values', {
      page,
      limit,
      status,
      pageIsNaN: isNaN(page),
      limitIsNaN: isNaN(limit)
    });

    // Validate page
    if (pageStr !== undefined) {
      if (isNaN(page) || page < 1) {
        logError('GET /admin/coupons - Page validation failed', { page, pageStr });
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: [{ msg: 'Page debe ser un número entero mayor a 0', param: 'page', value: pageStr }]
        });
      }
    } else {
      page = 1;
    }

    // Validate limit
    if (limitStr !== undefined) {
      if (isNaN(limit) || limit < 1 || limit > 100) {
        logError('GET /admin/coupons - Limit validation failed', { limit, limitStr });
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: [{ msg: 'Limit debe ser un número entre 1 y 100', param: 'limit', value: limitStr }]
        });
      }
    } else {
      limit = 50;
    }

    // Validate status
    if (status !== undefined && !['active', 'expired', 'all'].includes(status)) {
      logError('GET /admin/coupons - Status validation failed', { status, statusStr });
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: [{ msg: 'Status debe ser active, expired o all', param: 'status', value: statusStr }]
      });
    }
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT cu.id) as usage_count
      FROM coupons c
      LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
      WHERE 1=1
    `;
    const params = [];

    if (status === 'active') {
      sql += ' AND c.is_active = 1 AND (c.expires_at IS NULL OR c.expires_at > NOW())';
    } else if (status === 'expired') {
      sql += ' AND (c.is_active = 0 OR c.expires_at < NOW())';
    }

    sql += ' GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const coupons = await query(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM coupons WHERE 1=1';
    const countParams = [];
    if (status === 'active') {
      countSql += ' AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())';
    } else if (status === 'expired') {
      countSql += ' AND (is_active = 0 OR expires_at < NOW())';
    }
    const [countResult] = await query(countSql, countParams);

    const formattedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: parseFloat(coupon.value),
      usage: parseInt(coupon.usage_count || 0),
      limit: coupon.usage_limit ? parseInt(coupon.usage_limit) : null,
      status: coupon.is_active && (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) ? 'active' : 'expired',
      expiry: coupon.expires_at,
    }));

    res.json({
      success: true,
      data: {
        coupons: formattedCoupons,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.total),
          totalPages: Math.ceil(countResult.total / limit),
        },
      },
    });
  } catch (error) {
    logError('Error getting coupons:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cupones',
    });
  }
});

// ============================================
// GET /api/admin/customer-segments
// ============================================
// Obtener segmentos de clientes y clientes por segmento (requiere admin)
router.get('/customer-segments', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const segmentId = req.query.segment;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Calcular segmentos
    // VIP: Spent > $500 en últimos 3 meses
    const vipCustomers = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(SUM(o.total), 0) as total_spent,
        COUNT(DISTINCT o.id) as order_count,
        MAX(o.created_at) as last_order_date
      FROM users u
      INNER JOIN orders o ON u.id = o.user_id
      WHERE o.status != 'cancelled' 
        AND o.created_at >= ?
      GROUP BY u.id, u.name, u.email
      HAVING total_spent > 500
    `, [threeMonthsAgo]);

    // New: Primera compra en últimos 30 días
    const newCustomers = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(SUM(o.total), 0) as total_spent,
        COUNT(DISTINCT o.id) as order_count,
        MIN(o.created_at) as first_order_date,
        MAX(o.created_at) as last_order_date
      FROM users u
      INNER JOIN orders o ON u.id = o.user_id
      WHERE o.status != 'cancelled'
      GROUP BY u.id, u.name, u.email
      HAVING first_order_date >= ?
    `, [thirtyDaysAgo]);

    // At Risk: Sin compras en últimos 90 días pero con compras anteriores
    const atRiskCustomers = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(SUM(o.total), 0) as total_spent,
        COUNT(DISTINCT o.id) as order_count,
        MAX(o.created_at) as last_order_date
      FROM users u
      INNER JOIN orders o ON u.id = o.user_id
      WHERE o.status != 'cancelled'
      GROUP BY u.id, u.name, u.email
      HAVING last_order_date < ?
    `, [ninetyDaysAgo]);

    // High Value: AOV > $200
    const highValueCustomers = await query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COALESCE(SUM(o.total), 0) as total_spent,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(o.total), 0) / COUNT(DISTINCT o.id) as avg_order_value,
        MAX(o.created_at) as last_order_date
      FROM users u
      INNER JOIN orders o ON u.id = o.user_id
      WHERE o.status != 'cancelled'
      GROUP BY u.id, u.name, u.email
      HAVING avg_order_value > 200
    `);

    // Calcular revenue y growth para cada segmento
    const vipRevenue = vipCustomers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0);
    const newRevenue = newCustomers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0);
    const atRiskRevenue = atRiskCustomers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0);
    const highValueRevenue = highValueCustomers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0);

    const segments = [
      {
        id: 'vip',
        name: 'VIP Customers',
        count: vipCustomers.length,
        revenue: vipRevenue,
        growth: 12.5, // TODO: Calcular growth real comparando con período anterior
        color: 'rose',
        description: 'Spent > $500 in last 3 months'
      },
      {
        id: 'new',
        name: 'New Customers',
        count: newCustomers.length,
        revenue: newRevenue,
        growth: 24.0, // TODO: Calcular growth real
        color: 'blue',
        description: 'First purchase in last 30 days'
      },
      {
        id: 'risk',
        name: 'At Risk',
        count: atRiskCustomers.length,
        revenue: atRiskRevenue,
        growth: -5.2, // TODO: Calcular growth real
        color: 'amber',
        description: 'No purchase in last 90 days'
      },
      {
        id: 'high-value',
        name: 'High Value',
        count: highValueCustomers.length,
        revenue: highValueRevenue,
        growth: 8.4, // TODO: Calcular growth real
        color: 'purple',
        description: 'AOV > $200'
      }
    ];

    // Obtener clientes según segmento seleccionado
    let customers = [];
    if (segmentId === 'vip') {
      customers = vipCustomers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        spent: parseFloat(c.total_spent || 0),
        orders: parseInt(c.order_count || 0),
        lastOrder: formatTimeAgo(c.last_order_date),
        segment: 'VIP'
      }));
    } else if (segmentId === 'new') {
      customers = newCustomers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        spent: parseFloat(c.total_spent || 0),
        orders: parseInt(c.order_count || 0),
        lastOrder: formatTimeAgo(c.last_order_date),
        segment: 'New'
      }));
    } else if (segmentId === 'risk') {
      customers = atRiskCustomers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        spent: parseFloat(c.total_spent || 0),
        orders: parseInt(c.order_count || 0),
        lastOrder: formatTimeAgo(c.last_order_date),
        segment: 'At Risk'
      }));
    } else if (segmentId === 'high-value') {
      customers = highValueCustomers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        spent: parseFloat(c.total_spent || 0),
        orders: parseInt(c.order_count || 0),
        lastOrder: formatTimeAgo(c.last_order_date),
        segment: 'High Value'
      }));
    } else {
      // Todos los clientes con órdenes
      const allCustomers = await query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          COALESCE(SUM(o.total), 0) as total_spent,
          COUNT(DISTINCT o.id) as order_count,
          MAX(o.created_at) as last_order_date
        FROM users u
        INNER JOIN orders o ON u.id = o.user_id
        WHERE o.status != 'cancelled'
        GROUP BY u.id, u.name, u.email
        ORDER BY total_spent DESC
        LIMIT 50
      `);
      
      customers = allCustomers.map(c => {
        let segment = 'Regular';
        const spent = parseFloat(c.total_spent || 0);
        const lastOrder = new Date(c.last_order_date);
        const daysSinceLastOrder = (new Date().getTime() - lastOrder.getTime()) / (1000 * 60 * 60 * 24);
        
        if (spent > 500 && daysSinceLastOrder < 90) segment = 'VIP';
        else if (daysSinceLastOrder < 30) segment = 'New';
        else if (daysSinceLastOrder > 90) segment = 'At Risk';
        else if (spent / parseInt(c.order_count || 1) > 200) segment = 'High Value';
        
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          spent: spent,
          orders: parseInt(c.order_count || 0),
          lastOrder: formatTimeAgo(c.last_order_date),
          segment
        };
      });
    }

    res.json({
      success: true,
      data: {
        segments,
        customers
      }
    });
  } catch (error) {
    logError('Error getting customer segments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener segmentos de clientes',
    });
  }
});

// Helper function para formatear tiempo
function formatTimeAgo(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutos`;
  if (diffHours < 24) return `${diffHours} horas`;
  if (diffDays < 30) return `${diffDays} días`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} meses`;
}

// ============================================
// Admin Influencers Routes
// ============================================
const influencersAdminRoutes = require('./admin/influencers.routes');
router.use('/influencers', influencersAdminRoutes);

// ============================================
// GET /api/admin/categories
// ============================================
// Obtener todas las categorías (requiere admin)
router.get('/categories', authenticate, requireAdmin, rateLimiters.api, async (req, res) => {
  try {
    const categories = await query(`
      SELECT 
        id,
        name,
        slug,
        description,
        parent_id,
        image_url,
        is_active,
        sort_order,
        meta_title,
        meta_description,
        created_at,
        updated_at
      FROM categories
      ORDER BY sort_order ASC, name ASC
    `);

    // Contar productos por categoría
    for (const cat of categories) {
      const productCount = await query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = TRUE',
        [cat.id]
      );
      cat.product_count = parseInt(productCount[0].count) || 0;
    }

    res.json({
      success: true,
      data: {
        categories
      }
    });
  } catch (error) {
    logError('Error obteniendo categorías (admin):', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías'
    });
  }
});

module.exports = router;

