export class RetryBudget {
  constructor({ capacity = 100, refillPerSecond = 1, now = () => Date.now() } = {}) { this.capacity = capacity; this.tokens = capacity; this.refillPerSecond = refillPerSecond; this.now = now; this.lastRefill = now(); }
  consume(cost = 1) { const current = this.now(); this.tokens = Math.min(this.capacity, this.tokens + (current - this.lastRefill) / 1000 * this.refillPerSecond); this.lastRefill = current; if (this.tokens < cost) return false; this.tokens -= cost; return true; }
}

export function retryDelay(attempt, { baseMs = 250, maxMs = 30000, jitter = 0.2, random = Math.random } = {}) {
  const raw = Math.min(maxMs, baseMs * (2 ** Math.max(0, attempt - 1))); const spread = raw * jitter;
  return Math.max(0, Math.round(raw - spread + random() * spread * 2));
}

