// ============================================
// Prometheus Metrics Exporter
// ============================================
// FASE 4: Export de métricas en formato Prometheus

const metricsService = require('./metrics.service');

/**
 * Exportar métricas en formato Prometheus
 */
function exportPrometheus() {
  const metrics = metricsService.getMetrics();
  const lines = [];

  // Headers (comentarios)
  lines.push('# HELP rose_secret_requests_total Total number of HTTP requests');
  lines.push('# TYPE rose_secret_requests_total counter');
  lines.push(`rose_secret_requests_total ${metrics.requests.total}`);

  // Requests por método
  if (metrics.requests.byMethod) {
    lines.push('');
    lines.push('# HELP rose_secret_requests_by_method_total Total requests by HTTP method');
    lines.push('# TYPE rose_secret_requests_by_method_total counter');
    for (const [method, count] of Object.entries(metrics.requests.byMethod)) {
      lines.push(`rose_secret_requests_by_method_total{method="${method}"} ${count}`);
    }
  }

  // Requests por status
  if (metrics.requests.byStatus) {
    lines.push('');
    lines.push('# HELP rose_secret_requests_by_status_total Total requests by HTTP status');
    lines.push('# TYPE rose_secret_requests_by_status_total counter');
    for (const [status, count] of Object.entries(metrics.requests.byStatus)) {
      lines.push(`rose_secret_requests_by_status_total{status="${status}"} ${count}`);
    }
  }

  // Errores totales
  lines.push('');
  lines.push('# HELP rose_secret_errors_total Total number of errors');
  lines.push('# TYPE rose_secret_errors_total counter');
  lines.push(`rose_secret_errors_total ${metrics.errors.total}`);

  // Errores por tipo
  if (metrics.errors.byType) {
    lines.push('');
    lines.push('# HELP rose_secret_errors_by_type_total Total errors by error type');
    lines.push('# TYPE rose_secret_errors_by_type_total counter');
    for (const [type, count] of Object.entries(metrics.errors.byType)) {
      lines.push(`rose_secret_errors_by_type_total{type="${type}"} ${count}`);
    }
  }

  // Tiempo de respuesta promedio
  const avgResponseTime = metrics.responseTime.count > 0
    ? metrics.responseTime.total / metrics.responseTime.count
    : 0;
  
  lines.push('');
  lines.push('# HELP rose_secret_response_time_seconds Average response time in seconds');
  lines.push('# TYPE rose_secret_response_time_seconds gauge');
  lines.push(`rose_secret_response_time_seconds ${(avgResponseTime / 1000).toFixed(4)}`);

  // Cache hits/misses
  if (metrics.cache) {
    lines.push('');
    lines.push('# HELP rose_secret_cache_hits_total Total cache hits');
    lines.push('# TYPE rose_secret_cache_hits_total counter');
    lines.push(`rose_secret_cache_hits_total ${metrics.cache.hits || 0}`);

    lines.push('');
    lines.push('# HELP rose_secret_cache_misses_total Total cache misses');
    lines.push('# TYPE rose_secret_cache_misses_total counter');
    lines.push(`rose_secret_cache_misses_total ${metrics.cache.misses || 0}`);

    // Hit ratio
    const totalCacheOps = (metrics.cache.hits || 0) + (metrics.cache.misses || 0);
    const hitRatio = totalCacheOps > 0
      ? ((metrics.cache.hits || 0) / totalCacheOps) * 100
      : 0;

    lines.push('');
    lines.push('# HELP rose_secret_cache_hit_ratio Cache hit ratio percentage');
    lines.push('# TYPE rose_secret_cache_hit_ratio gauge');
    lines.push(`rose_secret_cache_hit_ratio ${hitRatio.toFixed(2)}`);
  }

  // Rate limiting
  if (metrics.rateLimit) {
    lines.push('');
    lines.push('# HELP rose_secret_rate_limit_allowed_total Total rate limit allowed requests');
    lines.push('# TYPE rose_secret_rate_limit_allowed_total counter');
    lines.push(`rose_secret_rate_limit_allowed_total ${metrics.rateLimit.allowed || 0}`);

    lines.push('');
    lines.push('# HELP rose_secret_rate_limit_exceeded_total Total rate limit exceeded requests');
    lines.push('# TYPE rose_secret_rate_limit_exceeded_total counter');
    lines.push(`rose_secret_rate_limit_exceeded_total ${metrics.rateLimit.exceeded || 0}`);
  }

  // Pagos
  if (metrics.payments) {
    lines.push('');
    lines.push('# HELP rose_secret_payments_total Total payment attempts');
    lines.push('# TYPE rose_secret_payments_total counter');
    lines.push(`rose_secret_payments_total ${metrics.payments.total || 0}`);

    lines.push('');
    lines.push('# HELP rose_secret_payments_succeeded_total Total succeeded payments');
    lines.push('# TYPE rose_secret_payments_succeeded_total counter');
    lines.push(`rose_secret_payments_succeeded_total ${metrics.payments.succeeded || 0}`);

    lines.push('');
    lines.push('# HELP rose_secret_payments_failed_total Total failed payments');
    lines.push('# TYPE rose_secret_payments_failed_total counter');
    lines.push(`rose_secret_payments_failed_total ${metrics.payments.failed || 0}`);
  }

  // Usuarios
  if (metrics.users) {
    lines.push('');
    lines.push('# HELP rose_secret_user_logins_total Total user logins');
    lines.push('# TYPE rose_secret_user_logins_total counter');
    lines.push(`rose_secret_user_logins_total ${metrics.users.logins || 0}`);

    lines.push('');
    lines.push('# HELP rose_secret_user_registrations_total Total user registrations');
    lines.push('# TYPE rose_secret_user_registrations_total counter');
    lines.push(`rose_secret_user_registrations_total ${metrics.users.registrations || 0}`);
  }

  return lines.join('\n') + '\n';
}

module.exports = {
  exportPrometheus
};

