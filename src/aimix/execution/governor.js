export class ResourceGovernor {
  constructor(limits = {}) { this.limits = { maxTokens: 200000, maxToolCalls: 50, maxAgentSteps: 100, maxWorkflowDepth: 20, maxDurationMs: 600000, ...limits }; }
  evaluate(usage = {}) {
    const checks = [
      ["tokens", "maxTokens"], ["toolCalls", "maxToolCalls"], ["agentSteps", "maxAgentSteps"],
      ["workflowDepth", "maxWorkflowDepth"], ["durationMs", "maxDurationMs"],
    ];
    const exceeded = checks.filter(([usageKey, limitKey]) => Number(usage[usageKey] || 0) > this.limits[limitKey]).map(([usageKey, limitKey]) => ({ resource: usageKey, used: usage[usageKey], limit: this.limits[limitKey] }));
    return { allowed: exceeded.length === 0, exceeded };
  }
}

export function detectAgentLoop(history = [], { repeatedActionLimit = 4, stagnationLimit = 5 } = {}) {
  const recent = history.slice(-Math.max(repeatedActionLimit, stagnationLimit));
  const repeated = recent.slice(-repeatedActionLimit).length === repeatedActionLimit && new Set(recent.slice(-repeatedActionLimit).map((item) => item.actionFingerprint)).size === 1;
  const stagnant = recent.slice(-stagnationLimit).length === stagnationLimit && new Set(recent.slice(-stagnationLimit).map((item) => item.stateFingerprint)).size === 1;
  return { looping: repeated || stagnant, reason: repeated ? "repeated_action" : stagnant ? "state_stagnation" : null };
}

