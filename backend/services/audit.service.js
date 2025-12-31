// ============================================
// Audit Service
// ============================================
// Servicio para registrar acciones críticas en BD

const { query, transaction, queryWithConnection } = require('../db');
const { audit: auditLog } = require('../logger');
const { error: logError } = require('../logger');

/**
 * Registrar acción de auditoría
 * @param {string} action - Acción realizada (e.g. "ORDER_CREATED", "ROLE_ASSIGNED")
 * @param {string} entity - Tipo de entidad (e.g. "order", "user", "role")
 * @param {number|null} entityId - ID de la entidad afectada
 * @param {object|null} oldValue - Valor anterior (opcional)
 * @param {object|null} newValue - Valor nuevo (opcional)
 * @param {object|null} req - Request object (opcional, para metadata)
 * @param {object|null} metadata - Metadata adicional (opcional)
 */
async function logAudit(action, entity, entityId = null, oldValue = null, newValue = null, req = null, metadata = null) {
  try {
    const auditData = {
      user_id: req?.user?.id || null,
      action,
      entity,
      entity_id: entityId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip: req?.ip || null,
      user_agent: req?.get('user-agent') || null,
      request_id: req?.requestId || req?.context?.requestId || null,
      api_version: req?.apiVersion || 1,
      metadata: metadata ? JSON.stringify(metadata) : null,
    };

    // Insertar en BD
    await query(`
      INSERT INTO audit_logs (
        user_id, action, entity, entity_id,
        old_value, new_value, ip, user_agent,
        request_id, api_version, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      auditData.user_id,
      auditData.action,
      auditData.entity,
      auditData.entity_id,
      auditData.old_value,
      auditData.new_value,
      auditData.ip,
      auditData.user_agent,
      auditData.request_id,
      auditData.api_version,
      auditData.metadata
    ]);

    // También loguear (para logs estructurados)
    auditLog(action, {
      entity,
      entityId,
      userId: auditData.user_id,
      requestId: auditData.request_id,
      apiVersion: auditData.api_version
    });

    return true;
  } catch (error) {
    // No fallar si la auditoría falla, pero loguear el error
    logError('Error logging audit', error, {
      action,
      entity,
      entityId
    });
    return false;
  }
}

/**
 * Obtener logs de auditoría
 */
async function getAuditLogs(filters = {}) {
  try {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.userId) {
      sql += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.action) {
      sql += ' AND action = ?';
      params.push(filters.action);
    }

    if (filters.entity) {
      sql += ' AND entity = ?';
      params.push(filters.entity);
    }

    if (filters.entityId) {
      sql += ' AND entity_id = ?';
      params.push(filters.entityId);
    }

    if (filters.startDate) {
      sql += ' AND created_at >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      sql += ' AND created_at <= ?';
      params.push(filters.endDate);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const limit = filters.limit || 50;
    const offset = (filters.page || 1 - 1) * limit;
    params.push(limit, offset);

    const logs = await query(sql, params);

    // Parsear JSON values
    return logs.map(log => ({
      ...log,
      old_value: log.old_value ? JSON.parse(log.old_value) : null,
      new_value: log.new_value ? JSON.parse(log.new_value) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));
  } catch (error) {
    logError('Error getting audit logs', error);
    throw error;
  }
}

module.exports = {
  logAudit,
  getAuditLogs
};

