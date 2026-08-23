const RISK_SCORE = Object.freeze({ read: 10, write: 35, network: 45, execute: 55, delete: 80, production: 95 });

export function authorizeAgentAction({ agent = {}, action = {}, policy = {} }) {
  const permissions = new Set(agent.permissions || []);
  const permission = `${action.resource || "*"}:${action.operation || "read"}`;
  const wildcard = `${action.resource || "*"}:*`;
  if (!permissions.has(permission) && !permissions.has(wildcard) && !permissions.has("*:*")) {
    return { decision: "deny", reason: "permission_missing", risk: 100 };
  }
  if (policy.allowedEnvironments?.length && !policy.allowedEnvironments.includes(action.environment)) {
    return { decision: "deny", reason: "environment_denied", risk: 100 };
  }
  if (policy.allowedNetworkHosts?.length && action.host && !policy.allowedNetworkHosts.includes(action.host)) {
    return { decision: "deny", reason: "network_destination_denied", risk: 100 };
  }
  const factors = action.riskFactors || [];
  const risk = Math.min(100, factors.reduce((sum, factor) => sum + (RISK_SCORE[factor] || 0), 0)
    + (action.reversible === false ? 20 : 0));
  const approvalAt = policy.approvalRiskThreshold ?? 60;
  const denyAt = policy.denyRiskThreshold ?? 90;
  if (risk >= denyAt) return { decision: "deny", reason: "risk_too_high", risk };
  if (risk >= approvalAt) return { decision: "require-approval", reason: "risk_requires_approval", risk };
  return { decision: "allow", reason: "policy_satisfied", risk };
}

