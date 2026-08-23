export function fingerprintWorkload(requests = []) {
  const total = requests.length || 1; const count = (predicate) => requests.filter(predicate).length / total;
  return {
    sampleSize: requests.length,
    codingRatio: count((item) => item.taskType === "coding"),
    reasoningRatio: count((item) => item.taskType === "reasoning"),
    longContextRatio: count((item) => (item.estimatedTokens || 0) > 32000),
    visionRatio: count((item) => item.modalities?.includes("image")),
    toolRatio: count((item) => item.requiresTools),
    latencySensitiveRatio: count((item) => item.latencySensitivity === "high"),
  };
}

export function planCapacity({ requestsPerSecond = 0, averageDurationMs = 0, averageTokens = 0, growthFactor = 1, safetyFactor = 1.25, providerCapacity = [] }) {
  const peakRps = requestsPerSecond * growthFactor * safetyFactor; const concurrency = Math.ceil(peakRps * averageDurationMs / 1000); const tokensPerSecond = peakRps * averageTokens;
  const availableRps = providerCapacity.reduce((sum, provider) => sum + (provider.requestsPerSecond || 0), 0);
  return { peakRps, requiredConcurrency: concurrency, tokensPerSecond, availableRps, capacityGapRps: Math.max(0, peakRps - availableRps), sufficient: availableRps >= peakRps };
}

