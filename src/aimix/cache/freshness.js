const TTL = Object.freeze({ strict: 0, recent: 60_000, normal: 300_000, "cache-ok": 3_600_000 });
export function freshnessPolicy(mode = "normal", customTtlMs) { const ttlMs = customTtlMs ?? TTL[mode]; if (ttlMs == null) throw new Error(`Unknown freshness mode: ${mode}`); return { mode, ttlMs, allowCache: ttlMs > 0, requireRevalidation: mode === "strict" || mode === "recent" }; }

