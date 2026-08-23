import { describe, expect, it } from "vitest";
import { detectAnomalies, diagnoseIncident, estimateCost, forecastBudget, forecastQuota } from "../../src/aimix/index.js";

describe("AIMix operational intelligence", () => {
  it("normalizes cost components", () => {
    const result = estimateCost({ inputTokens: 1_000_000, outputTokens: 500_000 }, { inputPerMillion: 2, outputPerMillion: 4 });
    expect(result.total).toBe(4);
  });
  it("forecasts budget and quota exhaustion", () => {
    expect(forecastBudget([{ cost: 10 }, { cost: 10 }], { budget: 100, elapsedDays: 2, periodDays: 30 }).breachLikely).toBe(true);
    expect(forecastQuota({ remaining: 100, usageSamples: [10, 10] }).samplesUntilExhaustion).toBe(10);
  });
  it("detects spikes and reconstructs incidents", () => {
    expect(detectAnomalies([{ cost: 1 }, { cost: 1 }, { cost: 20 }])).toEqual(expect.arrayContaining([expect.objectContaining({ field: "cost" })]));
    expect(diagnoseIncident([{ timestamp: "2020-01-01", type: "timeout" }, { timestamp: "2020-01-02", type: "fallback" }, { timestamp: "2020-01-03", type: "success" }])).toMatchObject({ diagnosis: "provider_timeout", recovered: true, fallbackCount: 1 });
  });
});
