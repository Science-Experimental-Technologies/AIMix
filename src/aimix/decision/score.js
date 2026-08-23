import { DEFAULT_WEIGHTS, OBJECTIVES } from "./constants.js";

const OBJECTIVE_WEIGHTS = Object.freeze({
  [OBJECTIVES.QUALITY]: { ...DEFAULT_WEIGHTS, quality: 0.55, cost: 0.05 },
  [OBJECTIVES.COST]: { ...DEFAULT_WEIGHTS, cost: 0.5, quality: 0.15 },
  [OBJECTIVES.LATENCY]: { ...DEFAULT_WEIGHTS, latency: 0.5, quality: 0.15 },
  [OBJECTIVES.RELIABILITY]: { ...DEFAULT_WEIGHTS, reliability: 0.5, quality: 0.2 },
  [OBJECTIVES.PRIVACY]: { ...DEFAULT_WEIGHTS, privacy: 0.5, quality: 0.2 },
});

const clamp = (value) => Math.max(0, Math.min(1, Number(value) || 0));

export function scoreCandidate(candidate, runtime = {}, policy = {}) {
  const weights = policy.weights || OBJECTIVE_WEIGHTS[policy.objective] || DEFAULT_WEIGHTS;
  const dimensions = {
    quality: clamp(runtime.quality ?? candidate.quality ?? 0.5),
    reliability: clamp(runtime.reliability ?? candidate.reliability ?? 0.5),
    latency: clamp(1 - (runtime.latencyMs ?? candidate.latencyMs ?? 1000) / (policy.latencyCeilingMs || 10000)),
    cost: clamp(1 - (runtime.estimatedCost ?? candidate.estimatedCost ?? 0) / (policy.costCeiling || 1)),
    quota: clamp(runtime.quotaRatio ?? 1),
    privacy: clamp(candidate.privacyScore ?? 0.5),
  };
  const total = Object.entries(weights).reduce((sum, [key, weight]) => sum + dimensions[key] * weight, 0);
  return { total, dimensions, weights };
}

