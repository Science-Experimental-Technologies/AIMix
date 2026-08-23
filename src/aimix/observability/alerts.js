export function evaluateAlertRules(metrics = {}, rules = []) {
  return rules.flatMap((rule) => {
    const value = Number(metrics[rule.metric]); const threshold = Number(rule.threshold); if (!Number.isFinite(value) || !Number.isFinite(threshold)) return [];
    const triggered = rule.operator === ">" ? value > threshold : rule.operator === ">=" ? value >= threshold : rule.operator === "<" ? value < threshold : rule.operator === "<=" ? value <= threshold : value === threshold;
    return triggered ? [{ id: rule.id, severity: rule.severity || "warning", metric: rule.metric, value, threshold, message: rule.message || `${rule.metric} ${rule.operator} ${threshold}` }] : [];
  });
}

