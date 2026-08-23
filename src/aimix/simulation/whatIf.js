export function simulateTopology({ workload = [], providers = [], scenario = {} }) {
  const available = providers.filter((provider) => !scenario.failedProviders?.includes(provider.id));
  let totalCost = 0;
  let weightedLatency = 0;
  let failedRequests = 0;
  const distribution = {};
  for (const item of workload) {
    const candidates = available.filter((provider) => !item.requiredCapabilities
      || item.requiredCapabilities.every((capability) => provider.capabilities?.includes(capability)));
    candidates.sort((a, b) => (a.costPerToken || 0) - (b.costPerToken || 0));
    const selected = candidates[0];
    const count = (item.count || 1) * (scenario.trafficMultiplier || 1);
    if (!selected) { failedRequests += count; continue; }
    distribution[selected.id] = (distribution[selected.id] || 0) + count;
    totalCost += count * (item.tokens || 0) * (selected.costPerToken || 0) * (scenario.priceMultiplier?.[selected.id] || 1);
    weightedLatency += count * (selected.latencyMs || 0) * (scenario.latencyMultiplier?.[selected.id] || 1);
  }
  const successful = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  return { totalCost, averageLatencyMs: successful ? weightedLatency / successful : 0, failedRequests, distribution };
}

