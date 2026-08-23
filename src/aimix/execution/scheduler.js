const PRIORITY = Object.freeze({ realtime: 5, interactive: 4, normal: 3, background: 2, batch: 1 });

export class PriorityScheduler {
  constructor({ concurrency = 4 } = {}) { this.concurrency = concurrency; this.active = 0; this.queue = []; this.sequence = 0; }
  schedule(operation, options = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject, priority: PRIORITY[options.priority] || PRIORITY.normal, deadline: options.deadline ? new Date(options.deadline).getTime() : Infinity, sequence: this.sequence++ });
      this.queue.sort((a, b) => b.priority - a.priority || a.deadline - b.deadline || a.sequence - b.sequence); this.drain();
    });
  }
  drain() {
    while (this.active < this.concurrency && this.queue.length) {
      const item = this.queue.shift();
      if (item.deadline < Date.now()) { item.reject(new Error("Request deadline exceeded")); continue; }
      this.active += 1;
      Promise.resolve().then(item.operation).then(item.resolve, item.reject).finally(() => { this.active -= 1; this.drain(); });
    }
  }
}

export class SlidingWindowLimiter {
  constructor({ limit, windowMs, now = () => Date.now() }) { this.limit = limit; this.windowMs = windowMs; this.now = now; this.events = new Map(); }
  consume(key, amount = 1) {
    const cutoff = this.now() - this.windowMs; const events = (this.events.get(key) || []).filter((event) => event.at > cutoff);
    const used = events.reduce((sum, event) => sum + event.amount, 0);
    if (used + amount > this.limit) return { allowed: false, remaining: Math.max(0, this.limit - used), retryAfterMs: events.length ? events[0].at + this.windowMs - this.now() : this.windowMs };
    events.push({ at: this.now(), amount }); this.events.set(key, events); return { allowed: true, remaining: this.limit - used - amount };
  }
}

