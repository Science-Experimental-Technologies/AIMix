import { describe, expect, it } from "vitest";
import { PriorityScheduler, ResourceGovernor, SlidingWindowLimiter, compareRegression, detectAgentLoop, recommendModelMigration } from "../../src/aimix/index.js";

describe("AIMix hardening", () => {
  it("enforces resource and hierarchical-style rate limits", () => {
    expect(new ResourceGovernor({ maxTokens: 10 }).evaluate({ tokens: 11 }).allowed).toBe(false);
    let now = 0; const limiter = new SlidingWindowLimiter({ limit: 2, windowMs: 10, now: () => now });
    expect(limiter.consume("project").allowed).toBe(true); expect(limiter.consume("project").allowed).toBe(true); expect(limiter.consume("project").allowed).toBe(false);
    now = 11; expect(limiter.consume("project").allowed).toBe(true);
  });
  it("detects agent loops", () => {
    expect(detectAgentLoop(Array.from({ length: 4 }, () => ({ actionFingerprint: "same", stateFingerprint: "x" }))).reason).toBe("repeated_action");
  });
  it("schedules work and checks deadlines", async () => {
    const scheduler = new PriorityScheduler({ concurrency: 1 });
    await expect(scheduler.schedule(async () => 1, { priority: "interactive" })).resolves.toBe(1);
    await expect(scheduler.schedule(async () => 2, { deadline: new Date(0) })).rejects.toThrow(/deadline/);
  });
  it("blocks regression and keeps migrations approval-gated", () => {
    expect(compareRegression([{ id: "x", score: 1 }], [{ id: "x", score: 0.5 }]).pass).toBe(false);
    const migration = recommendModelMigration("old", [{ id: "new", quality: 1, cost: 1, latency: 1 }], { minQuality: 0.9 });
    expect(migration).toMatchObject({ recommendation: { id: "new" }, requiresApproval: true });
  });
});
