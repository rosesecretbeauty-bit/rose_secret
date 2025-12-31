// ============================================
// API v2 Routes - Main Router
// ============================================
// Preparado para futuras versiones de la API
// Por ahora, vacío - se implementará cuando sea necesario

const express = require('express');
const router = express.Router();

// ============================================
// Nota: v2 está preparado pero no implementado
// ============================================
// Cuando se implemente v2:
// 1. Crear nuevas rutas en esta carpeta
// 2. Mantener v1 intacto
// 3. Documentar cambios en API-VERSIONING.md
// 4. Agregar período de deprecación para v1

router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API v2 is not yet implemented',
    currentVersion: 1,
    documentation: '/api/v1'
  });
});

module.exports = router;

