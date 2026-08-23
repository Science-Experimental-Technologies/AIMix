export function classifyExecutionError(error = {}) {
  const status = Number(error.status || error.statusCode || 0);
  const message = String(error.message || error.error || "").toLowerCase();
  if (status === 401 || status === 403) return { type: "authentication", retryable: false, action: "alternate-account" };
  if (status === 429 || /rate.?limit/.test(message)) return { type: "rate-limit", retryable: true, action: "alternate-account" };
  if (/quota|credit.*exhaust|insufficient.*balance/.test(message)) return { type: "quota-exhausted", retryable: false, action: "alternate-provider" };
  if (/context.*(length|window)|too many tokens|maximum context/.test(message)) return { type: "context-overflow", retryable: true, action: "optimize-context" };
  if (/unsupported|not support|capability/.test(message)) return { type: "unsupported-capability", retryable: false, action: "compatible-model" };
  if (status === 408 || /timeout|timed out/.test(message)) return { type: "timeout", retryable: true, action: "backoff" };
  if (status >= 500 || /overload|unavailable|connection reset/.test(message)) return { type: "provider-outage", retryable: true, action: "alternate-provider" };
  if (status >= 400 && status < 500) return { type: "invalid-request", retryable: false, action: "stop" };
  return { type: "unknown", retryable: false, action: "stop" };
}

