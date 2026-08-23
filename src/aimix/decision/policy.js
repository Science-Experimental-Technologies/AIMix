import { PRIVACY_LEVELS } from "./constants.js";

function reject(code, detail) {
  return { allowed: false, code, detail };
}

export function evaluateHardConstraints(candidate, request, policy = {}, runtime = {}) {
  if (candidate.enabled === false) return reject("candidate_disabled", "Candidate is disabled");
  if (runtime.circuitOpen) return reject("circuit_open", "Provider circuit is open");
  if (runtime.healthy === false) return reject("provider_unhealthy", "Provider is unhealthy");
  if (runtime.quotaRemaining != null && runtime.quotaRemaining <= 0) {
    return reject("quota_exhausted", "No quota remains");
  }
  if (policy.allowedProviders?.length && !policy.allowedProviders.includes(candidate.providerId)) {
    return reject("provider_not_allowed", "Provider is outside the allowlist");
  }
  if (policy.deniedProviders?.includes(candidate.providerId)) {
    return reject("provider_denied", "Provider is denied by policy");
  }
  if (policy.allowedRegions?.length && !policy.allowedRegions.includes(candidate.region)) {
    return reject("region_not_allowed", "Region is outside the allowlist");
  }

  const requestPrivacy = PRIVACY_LEVELS[request.privacyLevel?.toUpperCase()] ?? PRIVACY_LEVELS.INTERNAL;
  const candidatePrivacy = PRIVACY_LEVELS[candidate.maxPrivacyLevel?.toUpperCase()] ?? PRIVACY_LEVELS.PUBLIC;
  if (candidatePrivacy < requestPrivacy) return reject("privacy_mismatch", "Provider cannot handle this data class");

  const required = new Set([
    ...(request.modalities || []),
    ...(request.requiresTools ? ["tools"] : []),
    ...(request.requiresStructuredOutput ? ["structured-output"] : []),
  ]);
  const capabilities = new Set(candidate.capabilities || []);
  const missing = [...required].filter((capability) => !capabilities.has(capability));
  if (missing.length) return reject("capability_mismatch", `Missing: ${missing.join(", ")}`);

  if (candidate.contextWindow && request.estimatedTokens > candidate.contextWindow) {
    return reject("context_overflow", "Estimated context exceeds model window");
  }
  if (policy.hardRequestCost != null && runtime.estimatedCost > policy.hardRequestCost) {
    return reject("request_budget_exceeded", "Estimated request cost exceeds hard limit");
  }
  return { allowed: true, code: "allowed" };
}

