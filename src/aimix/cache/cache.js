import { createHash } from "node:crypto";

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}

function words(value) {
  return new Set(JSON.stringify(value).toLowerCase().match(/[a-z0-9_]{2,}/g) || []);
}

function similarity(a, b) {
  const left = words(a); const right = words(b);
  if (!left.size && !right.size) return 1;
  let intersection = 0; for (const word of left) if (right.has(word)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

export function cacheKey(request, versions = {}) {
  return createHash("sha256").update(JSON.stringify(stable({ request, versions }))).digest("hex");
}

export class AIMixCache {
  constructor({ now = () => Date.now(), maxEntries = 1000 } = {}) { this.now = now; this.maxEntries = maxEntries; this.entries = new Map(); this.inflight = new Map(); }
  set(request, value, { ttlMs = 300000, versions = {}, metadata = {} } = {}) {
    const key = cacheKey(request, versions);
    this.entries.set(key, { key, request: stable(request), value, versions, metadata, createdAt: this.now(), expiresAt: this.now() + ttlMs });
    while (this.entries.size > this.maxEntries) this.entries.delete(this.entries.keys().next().value);
    return key;
  }
  get(request, { versions = {}, freshness = "normal", semanticThreshold = 0.92 } = {}) {
    if (freshness === "strict") return { hit: false, reason: "strict_freshness" };
    const key = cacheKey(request, versions); const exact = this.entries.get(key);
    if (exact && exact.expiresAt > this.now()) return { hit: true, kind: "exact", entry: exact };
    if (freshness === "recent") return { hit: false, reason: "exact_miss" };
    for (const entry of this.entries.values()) {
      if (entry.expiresAt <= this.now() || JSON.stringify(entry.versions) !== JSON.stringify(versions)) continue;
      const score = similarity(request, entry.request);
      if (score >= semanticThreshold) return { hit: true, kind: "semantic", score, entry };
    }
    return { hit: false, reason: "cache_miss" };
  }
  invalidate(predicate = () => true) { let count = 0; for (const [key, entry] of this.entries) if (predicate(entry)) { this.entries.delete(key); count += 1; } return count; }
  async coalesce(key, operation) {
    if (this.inflight.has(key)) return this.inflight.get(key);
    const promise = Promise.resolve().then(operation).finally(() => this.inflight.delete(key));
    this.inflight.set(key, promise); return promise;
  }
}

