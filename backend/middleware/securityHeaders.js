// ============================================
// Security Headers Middleware
// ============================================
// Agrega headers de seguridad HTTP

/**
 * Middleware de security headers
 */
function securityHeaders(req, res, next) {
  // X-Content-Type-Options: Prevenir MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options: Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection: Activar filtro XSS en navegadores antiguos
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy: Controlar información de referrer
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  // Permissions-Policy: Deshabilitar features no necesarias
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  
  // Strict-Transport-Security ya está en Helmet, pero lo incluimos por si acaso
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
}

module.exports = securityHeaders;

