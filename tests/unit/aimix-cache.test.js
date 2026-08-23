import { describe, expect, it, vi } from "vitest";
import { AIMixCache, cacheKey, optimizeContext } from "../../src/aimix/index.js";

describe("AIMix context and cache", () => {
  it("creates stable version-aware keys", () => {
    expect(cacheKey({ b: 2, a: 1 }, { prompt: 1 })).toBe(cacheKey({ a: 1, b: 2 }, { prompt: 1 }));
    expect(cacheKey({ a: 1 }, { prompt: 1 })).not.toBe(cacheKey({ a: 1 }, { prompt: 2 }));
  });
  it("supports exact, semantic, freshness, TTL, and invalidation", () => {
    let now = 0; const cache = new AIMixCache({ now: () => now });
    cache.set({ prompt: "explain the routing decision" }, "answer", { ttlMs: 10, versions: { model: 1 } });
    expect(cache.get({ prompt: "explain the routing decision" }, { versions: { model: 1 } }).kind).toBe("exact");
    expect(cache.get({ prompt: "explain routing decision" }, { versions: { model: 1 }, semanticThreshold: 0.7 }).kind).toBe("semantic");
    expect(cache.get({ prompt: "explain the routing decision" }, { versions: { model: 1 }, freshness: "strict" }).hit).toBe(false);
    now = 11; expect(cache.get({ prompt: "explain the routing decision" }, { versions: { model: 1 } }).hit).toBe(false);
  });
  it("coalesces concurrent requests", async () => {
    const cache = new AIMixCache(); const operation = vi.fn(async () => 42);
    expect(await Promise.all([cache.coalesce("x", operation), cache.coalesce("x", operation)])).toEqual([42, 42]);
    expect(operation).toHaveBeenCalledTimes(1);
  });
  it("deduplicates and compresses low-priority tool context", () => {
    const result = optimizeContext([{ role: "user", content: "same" }, { role: "user", content: "same" }, { role: "tool", content: "x".repeat(3000) }], { mode: "minimal" });
    expect(result.messages).toHaveLength(2); expect(result.savedCharacters).toBeGreaterThan(0);
  });
});
