export function createDecisionTrace({ requestId, classification, plan, policyId = null }) {
  return {
    requestId,
    policyId,
    timestamp: new Date().toISOString(),
    classification,
    selectedRoute: plan.selected?.id || null,
    decisionReason: plan.reason,
    candidates: plan.candidates.map(({ candidate, score }) => ({
      id: candidate.id,
      providerId: candidate.providerId,
      modelId: candidate.modelId,
      score: score.total,
      dimensions: score.dimensions,
    })),
    rejected: plan.rejected,
  };
}

