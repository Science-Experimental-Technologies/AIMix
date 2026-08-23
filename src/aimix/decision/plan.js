import { evaluateHardConstraints } from "./policy.js";
import { scoreCandidate } from "./score.js";

export function createExecutionPlan({ request, candidates = [], policy = {}, runtimeByCandidate = {} }) {
  const accepted = [];
  const rejected = [];
  for (const candidate of candidates) {
    const runtime = runtimeByCandidate[candidate.id] || {};
    const decision = evaluateHardConstraints(candidate, request, policy, runtime);
    if (!decision.allowed) {
      rejected.push({ candidateId: candidate.id, ...decision });
      continue;
    }
    accepted.push({ candidate, score: scoreCandidate(candidate, runtime, policy) });
  }
  accepted.sort((a, b) => b.score.total - a.score.total || a.candidate.id.localeCompare(b.candidate.id));
  return {
    selected: accepted[0]?.candidate || null,
    candidates: accepted,
    rejected,
    reason: accepted.length ? "highest_weighted_score_after_hard_constraints" : "no_eligible_candidate",
  };
}

