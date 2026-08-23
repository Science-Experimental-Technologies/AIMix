export function calculateHealthScore(metrics = {}, weights = {}) {
  const w = { success: 0.35, latency: 0.2, errors: 0.2, timeout: 0.1, quota: 0.1, incidents: 0.05, ...weights };
  const latencyScore = Math.max(0, 1 - (metrics.p95LatencyMs || 0) / (metrics.latencySloMs || 10000));
  const dimensions = { success: metrics.successRate ?? 1, latency: latencyScore, errors: 1 - (metrics.errorRate ?? 0), timeout: 1 - (metrics.timeoutRate ?? 0), quota: metrics.quotaRatio ?? 1, incidents: Math.max(0, 1 - (metrics.recentIncidents || 0) / 10) };
  const score = Object.entries(w).reduce((sum, [key, weight]) => sum + Math.max(0, Math.min(1, dimensions[key])) * weight, 0);
  return { score, dimensions, status: score >= 0.8 ? "healthy" : score >= 0.5 ? "degraded" : "unhealthy" };
}

