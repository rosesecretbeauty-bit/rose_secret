// ============================================
// Test Authentication Helper
// ============================================
// Helper para crear tokens y mockear autenticación en tests

const jwt = require('jsonwebtoken');
const { query } = require('../../db');

/**
 * Crear token JWT para tests
 */
function createTestToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
}

/**
 * Middleware de autenticación para tests
 * Simula el comportamiento del middleware real pero sin rate limiting
 */
async function testAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
      
      if (!decoded.userId) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciales inválidas' 
        });
      }

      // Obtener usuario de la BD con roles (como en el middleware real)
      const users = await query(
        `SELECT u.id, u.email, u.name, u.role,
                GROUP_CONCAT(DISTINCT r.id) as role_ids,
                GROUP_CONCAT(DISTINCT r.name) as role_names
         FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         LEFT JOIN roles r ON ur.role_id = r.id
         WHERE u.id = ?
         GROUP BY u.id`,
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciales inválidas' 
        });
      }

      const user = users[0];
      
      // Parsear roles
      user.role_ids = user.role_ids ? user.role_ids.split(',').map(Number) : [];
      user.role_names = user.role_names ? user.role_names.split(',') : [];
      
      // Mantener compatibilidad con sistema antiguo
      if (!user.role && user.role_names.length > 0) {
        user.role = user.role_names[0];
      }

      req.user = user;
      return next();
    } catch (verifyError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error en autenticación' 
    });
  }
}

/**
 * Middleware requireAdmin para tests
 */
function testRequireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Autenticación requerida' 
    });
  }
  
  const isAdmin = req.user.role === 'admin' || 
                  (req.user.role_names && Array.isArray(req.user.role_names) && req.user.role_names.includes('admin'));
  
  if (!isAdmin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado. Se requiere rol de administrador' 
    });
  }
  
  return next();
}

module.exports = {
  createTestToken,
  testAuthenticate,
  testRequireAdmin
};
