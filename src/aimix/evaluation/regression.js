export function compareRegression(baseline = [], candidate = [], { tolerance = 0 } = {}) {
  const candidateById = new Map(candidate.map((result) => [result.id, result]));
  const cases = baseline.map((base) => {
    const next = candidateById.get(base.id); if (!next) return { id: base.id, status: "missing", delta: -Infinity };
    const delta = (next.score || 0) - (base.score || 0); return { id: base.id, status: delta < -tolerance ? "regressed" : delta > tolerance ? "improved" : "stable", delta, baseline: base.score, candidate: next.score };
  });
  return { pass: cases.every((item) => item.status !== "regressed" && item.status !== "missing"), cases, summary: Object.fromEntries(["improved", "stable", "regressed", "missing"].map((status) => [status, cases.filter((item) => item.status === status).length])) };
}

export function recommendModelMigration(current, candidates = [], constraints = {}) {
  const eligible = candidates.filter((candidate) => (constraints.requiredCapabilities || []).every((capability) => (candidate.capabilities || []).includes(capability)))
    .filter((candidate) => !constraints.maxCost || candidate.cost <= constraints.maxCost)
    .filter((candidate) => !constraints.minQuality || candidate.quality >= constraints.minQuality)
    .sort((a, b) => b.quality - a.quality || a.cost - b.cost || a.latency - b.latency);
  return { current, recommendation: eligible[0] || null, requiresApproval: true, candidates: eligible };
}
