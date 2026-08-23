const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function estimateCost(usage = {}, pricing = {}) {
  const input = number(usage.inputTokens ?? usage.promptTokens);
  const output = number(usage.outputTokens ?? usage.completionTokens);
  const reasoning = number(usage.reasoningTokens);
  const cached = number(usage.cachedInputTokens);
  const media = number(usage.mediaUnits);
  const components = {
    input: input / 1_000_000 * number(pricing.inputPerMillion),
    output: output / 1_000_000 * number(pricing.outputPerMillion),
    reasoning: reasoning / 1_000_000 * number(pricing.reasoningPerMillion ?? pricing.outputPerMillion),
    cachedInput: cached / 1_000_000 * number(pricing.cachedInputPerMillion),
    media: media * number(pricing.mediaPerUnit),
  };
  return { total: Object.values(components).reduce((sum, value) => sum + value, 0), components, usage: { input, output, reasoning, cached, media } };
}

export function forecastBudget(samples = [], { budget, periodDays = 30, elapsedDays } = {}) {
  const spent = samples.reduce((sum, sample) => sum + number(sample.cost), 0);
  const days = Math.max(1, number(elapsedDays) || new Set(samples.map((sample) => String(sample.timestamp).slice(0, 10))).size || 1);
  const dailyAverage = spent / days; const projected = dailyAverage * periodDays;
  return { spent, dailyAverage, projected, budget: number(budget), breachLikely: number(budget) > 0 && projected > number(budget), daysUntilBudget: dailyAverage > 0 ? Math.max(0, (number(budget) - spent) / dailyAverage) : null };
}

export function forecastQuota({ remaining, usageSamples = [], resetAt, now = Date.now() }) {
  const total = usageSamples.reduce((sum, value) => sum + number(value), 0);
  const average = usageSamples.length ? total / usageSamples.length : 0;
  const samplesUntilExhaustion = average > 0 ? number(remaining) / average : null;
  return { remaining: number(remaining), averagePerSample: average, samplesUntilExhaustion, resetInMs: resetAt ? Math.max(0, new Date(resetAt).getTime() - now) : null };
}

