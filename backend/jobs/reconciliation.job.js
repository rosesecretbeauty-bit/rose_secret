// ============================================
// Reconciliation Job (Scheduled)
// ============================================
// Ejecuta reconciliación de pagos periódicamente

const reconciliationService = require('../services/reconciliation.service');
const { info, error: logError } = require('../logger');

/**
 * Ejecutar job de reconciliación
 * Llamar desde cron job o scheduler
 */
async function runReconciliationJob() {
  try {
    info('Starting scheduled reconciliation job');
    const result = await reconciliationService.reconcilePendingPayments();
    info('Scheduled reconciliation job completed', result);
    return result;
  } catch (error) {
    logError('Error in scheduled reconciliation job:', error);
    throw error;
  }
}

// Si se ejecuta directamente (para testing)
if (require.main === module) {
  runReconciliationJob()
    .then(result => {
      console.log('Reconciliation completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Reconciliation failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runReconciliationJob
};

