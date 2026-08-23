export function proposeRoutingChange({ baseline, candidate, minSamples = 100, confidenceThreshold = 0.95 }) {
  const samples = Math.min(baseline.samples || 0, candidate.samples || 0);
  const qualityDelta = (candidate.quality || 0) - (baseline.quality || 0);
  const costDelta = (candidate.cost || 0) - (baseline.cost || 0);
  const confidence = samples <= 0 ? 0 : Math.min(0.999, 1 - Math.exp(-samples / minSamples));
  const beneficial = qualityDelta >= 0 && costDelta < 0;
  return { status: beneficial && samples >= minSamples && confidence >= confidenceThreshold ? "proposed" : "insufficient-evidence", confidence, samples, qualityDelta, costDelta, requiredStages: ["simulate", "benchmark", "shadow", "ab-test", "approve", "deploy", "monitor"], productionEligible: false };
}

export function advanceChangeProposal(proposal, stage, approval = {}) {
  const order = proposal.requiredStages || [];
  const history = proposal.history || [];
  const expected = order[history.length];
  if (stage !== expected) throw new Error(`Expected stage ${expected || "none"}`);
  if (stage === "approve" && (!approval.approver || !approval.reason)) throw new Error("Approval requires approver and reason");
  const next = { ...proposal, history: [...history, { stage, at: new Date().toISOString(), ...approval }] };
  next.productionEligible = stage === "monitor" && next.history.some((entry) => entry.stage === "approve");
  return next;
}

