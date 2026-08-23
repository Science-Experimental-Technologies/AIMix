import { describe, expect, it } from "vitest";
import { evaluateAlertRules, fingerprintWorkload, freshnessPolicy, planCapacity } from "../../src/aimix/index.js";

describe("AIMix operations", () => {
  it("evaluates alert rules", () => expect(evaluateAlertRules({ errorRate: 0.2 }, [{ id: "e", metric: "errorRate", operator: ">", threshold: 0.1 }])).toHaveLength(1));
  it("fingerprints workload without retaining content", () => expect(fingerprintWorkload([{ taskType: "coding", requiresTools: true }])).toMatchObject({ sampleSize: 1, codingRatio: 1, toolRatio: 1 }));
  it("plans capacity with growth and safety factors", () => expect(planCapacity({ requestsPerSecond: 10, averageDurationMs: 1000, growthFactor: 2, providerCapacity: [{ requestsPerSecond: 30 }] })).toMatchObject({ requiredConcurrency: 25, sufficient: true }));
  it("enforces freshness modes", () => { expect(freshnessPolicy("strict").allowCache).toBe(false); expect(freshnessPolicy("cache-ok").ttlMs).toBe(3_600_000); });
});
