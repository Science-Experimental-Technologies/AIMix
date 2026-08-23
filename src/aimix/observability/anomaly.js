function stats(values) {
  if (!values.length) return { mean: 0, deviation: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
  return { mean, deviation };
}

export function detectAnomalies(samples = [], { fields = ["cost", "latency", "tokens", "errors"], zThreshold = 3 } = {}) {
  if (samples.length < 3) return [];
  const baseline = samples.slice(0, -1); const current = samples.at(-1); const anomalies = [];
  for (const field of fields) {
    const values = baseline.map((sample) => Number(sample[field]) || 0); const { mean, deviation } = stats(values);
    const value = Number(current[field]) || 0; const zScore = deviation === 0 ? (value === mean ? 0 : Infinity) : (value - mean) / deviation;
    if (zScore >= zThreshold) anomalies.push({ field, value, mean, zScore, direction: "spike" });
  }
  return anomalies;
}

