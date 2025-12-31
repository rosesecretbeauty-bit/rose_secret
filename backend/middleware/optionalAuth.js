// ============================================
// Middleware de Autenticación Opcional
// ============================================
// Permite acceso a usuarios autenticados y guests

const jwt = require('jsonwebtoken');
const { query } = require('../db');

/**
 * Middleware que intenta autenticar, pero permite continuar si no hay token
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Si no hay header, continuar como guest
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.isGuest = true;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });

      // Verificar que el usuario existe
      const users = await query(
        'SELECT id, email, role FROM users WHERE id = ? LIMIT 1',
        [decoded.userId]
      );

      if (users.length === 0) {
        req.user = null;
        req.isGuest = true;
        return next();
      }

      req.user = {
        id: users[0].id,
        email: users[0].email,
        role: users[0].role
      };
      req.isGuest = false;
    } catch (error) {
      // Si el token es inválido, continuar como guest
      req.user = null;
      req.isGuest = true;
    }

    next();
  } catch (error) {
    // En caso de error, continuar como guest
    req.user = null;
    req.isGuest = true;
    next();
  }
};

module.exports = { optionalAuthenticate };

