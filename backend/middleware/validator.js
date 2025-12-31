// ============================================
// Validación y Sanitización Centralizada
// ============================================

const { body, param, query, validationResult } = require('express-validator');
const { sanitizeBody, sanitizeParam, sanitizeQuery } = require('express-validator');

/**
 * Sanitizar string para prevenir XSS
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // Remover < y >
    .trim();
}

/**
 * Sanitizar email
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') return email;
  return email.toLowerCase().trim();
}

/**
 * Validadores comunes
 */
const validators = {
  // Validar ID numérico
  id: param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
  
  // Validar email
  email: body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .customSanitizer(sanitizeEmail),
  
  // Validar password
  password: body('password')
    .isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password debe contener al menos una mayúscula, una minúscula y un número')
    .optional(),
  
  // Validar nombre
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Nombre debe tener entre 2 y 255 caracteres')
    .customSanitizer(sanitizeString),
  
  // Validar precio
  price: body('price')
    .isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  
  // Validar stock
  stock: body('stock')
    .isInt({ min: 0 }).withMessage('Stock debe ser un número entero no negativo'),
  
  // Validar cantidad
  quantity: body('quantity')
    .isInt({ min: 1 }).withMessage('Cantidad debe ser un número entero positivo'),
  
  // Validar dirección de envío
  shipping: {
    name: body('shipping_name')
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Nombre debe tener entre 2 y 255 caracteres')
      .customSanitizer(sanitizeString),
    street: body('shipping_street')
      .trim()
      .isLength({ min: 5, max: 255 }).withMessage('Dirección debe tener entre 5 y 255 caracteres')
      .customSanitizer(sanitizeString),
    city: body('shipping_city')
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Ciudad debe tener entre 2 y 255 caracteres')
      .customSanitizer(sanitizeString),
    state: body('shipping_state')
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Estado debe tener entre 2 y 100 caracteres')
      .customSanitizer(sanitizeString),
    zip: body('shipping_zip')
      .trim()
      .isLength({ min: 3, max: 20 }).withMessage('Código postal debe tener entre 3 y 20 caracteres'),
    country: body('shipping_country')
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('País debe tener entre 2 y 100 caracteres')
      .customSanitizer(sanitizeString),
    phone: body('shipping_phone')
      .optional()
      .trim()
      .isLength({ max: 20 }).withMessage('Teléfono inválido')
  }
};

/**
 * Middleware para validar resultados
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
}

/**
 * Sanitizar body, params y query
 */
function sanitize(req, res, next) {
  // Sanitizar body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  
  // Sanitizar query
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }
  
  next();
}

module.exports = {
  validators,
  validate,
  sanitize,
  sanitizeString,
  sanitizeEmail
};

