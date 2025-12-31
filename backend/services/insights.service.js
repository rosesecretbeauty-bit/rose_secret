// ============================================
// Insights Service - Estadísticas de Usuario
// ============================================

const { query } = require('../db');
const { error: logError } = require('../logger');

/**
 * Obtener estadísticas de gasto del usuario
 */
async function getUserSpendingInsights(userId, months = 6) {
  try {
    // Calcular fecha de inicio
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Total gastado
    const totalSpentResult = await query(
      `SELECT COALESCE(SUM(total), 0) as total_spent,
              COUNT(*) as orders_count,
              COALESCE(AVG(total), 0) as avg_order_value
       FROM orders 
       WHERE user_id = ? AND status IN ('paid', 'delivered', 'completed')`,
      [userId]
    );

    const stats = totalSpentResult[0] || {
      total_spent: 0,
      orders_count: 0,
      avg_order_value: 0
    };

    // Monto ahorrado (descuentos aplicados)
    const savedResult = await query(
      `SELECT COALESCE(SUM(discount), 0) as saved_amount
       FROM orders 
       WHERE user_id = ? AND status IN ('paid', 'delivered', 'completed') AND discount > 0`,
      [userId]
    );

    const savedAmount = savedResult[0]?.saved_amount || 0;

    // Categoría más comprada
    const topCategoryResult = await query(
      `SELECT c.name as category_name, COUNT(*) as purchase_count
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       INNER JOIN products p ON oi.product_id = p.id
       INNER JOIN categories c ON p.category_id = c.id
       WHERE o.user_id = ? AND o.status IN ('paid', 'delivered', 'completed')
       GROUP BY c.id, c.name
       ORDER BY purchase_count DESC
       LIMIT 1`,
      [userId]
    );

    const topCategory = topCategoryResult.length > 0 ? topCategoryResult[0].category_name : null;
    const topCategoryCount = topCategoryResult.length > 0 ? topCategoryResult[0].purchase_count : 0;

    // Gasto mensual (últimos N meses)
    const monthlySpending = await query(
      `SELECT 
         DATE_FORMAT(created_at, '%Y-%m') as month,
         DATE_FORMAT(created_at, '%b') as month_name,
         COALESCE(SUM(total), 0) as amount
       FROM orders 
       WHERE user_id = ? 
         AND status IN ('paid', 'delivered', 'completed')
         AND created_at >= ?
       GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
       ORDER BY month ASC`,
      [userId, startDate]
    );

    // Comparación con período anterior (si hay datos)
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - months);
    
    const previousPeriodResult = await query(
      `SELECT COALESCE(SUM(total), 0) as total_spent
       FROM orders 
       WHERE user_id = ? 
         AND status IN ('paid', 'delivered', 'completed')
         AND created_at >= ? AND created_at < ?`,
      [userId, previousPeriodStart, startDate]
    );

    const previousTotal = previousPeriodResult[0]?.total_spent || 0;
    const currentTotal = parseFloat(stats.total_spent) || 0;
    const growthPercent = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1)
      : currentTotal > 0 ? 100 : 0;

    return {
      total_spent: parseFloat(stats.total_spent) || 0,
      orders_count: parseInt(stats.orders_count) || 0,
      avg_order_value: parseFloat(stats.avg_order_value) || 0,
      saved_amount: parseFloat(savedAmount) || 0,
      top_category: topCategory,
      top_category_count: parseInt(topCategoryCount) || 0,
      growth_percent: parseFloat(growthPercent),
      monthly_spending: monthlySpending.map(m => ({
        month: m.month_name,
        amount: parseFloat(m.amount) || 0
      }))
    };
  } catch (error) {
    logError('Error getting spending insights:', error);
    throw error;
  }
}

module.exports = {
  getUserSpendingInsights
};

