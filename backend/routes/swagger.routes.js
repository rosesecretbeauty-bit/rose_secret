// ============================================
// Swagger Documentation Routes
// ============================================
// FASE 5: Endpoint para documentación de API

const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../docs/swagger');

// Endpoint de documentación (público, pero en producción puede requerir auth)
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Rose Secret API Documentation'
}));

// Endpoint para obtener spec JSON
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;

