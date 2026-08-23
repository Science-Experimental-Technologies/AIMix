import { describe, expect, it } from "vitest";
import { RetryBudget, buildFallbackPath, calculateHealthScore, retryDelay } from "../../src/aimix/index.js";

describe("AIMix resilience", () => {
  it("calculates explainable provider health", () => {
    expect(calculateHealthScore({ successRate: 1, errorRate: 0, timeoutRate: 0, quotaRatio: 1, p95LatencyMs: 100, latencySloMs: 1000 }).status).toBe("healthy");
  });
  it("enforces retry budgets and bounded backoff", () => {
    let now = 0; const budget = new RetryBudget({ capacity: 1, refillPerSecond: 1, now: () => now });
    expect(budget.consume()).toBe(true); expect(budget.consume()).toBe(false); now = 1000; expect(budget.consume()).toBe(true);
    expect(retryDelay(3, { baseMs: 100, jitter: 0, random: () => 0 })).toBe(400);
  });
  it("traverses typed fallback edges and records reasons", () => {
    const graph = { nodes: [{ id: "account-a" }, { id: "account-b" }, { id: "provider-b" }], edges: [{ from: "account-a", to: "account-b", on: ["rate-limit"] }, { from: "account-b", to: "provider-b", on: ["quota-exhausted"] }] };
    const result = buildFallbackPath(graph, "account-a", [{ status: 429 }, { message: "quota exhausted" }]);
    expect(result.path).toEqual(["account-a", "account-b", "provider-b"]); expect(result.reasons[0].error).toBe("rate-limit");
  });
});
