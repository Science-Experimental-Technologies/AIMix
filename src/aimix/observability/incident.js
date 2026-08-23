export function diagnoseIncident(events = []) {
  const timeline = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const types = new Set(timeline.map((event) => event.type));
  let diagnosis = "unknown";
  if (types.has("quota-exhausted")) diagnosis = "quota_exhaustion";
  else if (types.has("context-overflow")) diagnosis = "context_overflow";
  else if (types.has("policy-denial")) diagnosis = "policy_denial";
  else if (types.has("tool-schema-error")) diagnosis = "invalid_tool_schema";
  else if (timeline.filter((event) => event.type === "provider-error").length >= 2) diagnosis = "provider_instability";
  else if (types.has("timeout")) diagnosis = "provider_timeout";
  return { diagnosis, recovered: types.has("success"), fallbackCount: timeline.filter((event) => event.type === "fallback").length, timeline };
}

