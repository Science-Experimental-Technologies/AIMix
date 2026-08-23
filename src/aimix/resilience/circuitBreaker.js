export class CircuitBreaker {
  constructor({ failureThreshold = 5, cooldownMs = 30000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.states = new Map();
  }

  state(key, now = Date.now()) {
    const current = this.states.get(key) || { failures: 0, status: "closed", openedAt: 0 };
    if (current.status === "open" && now - current.openedAt >= this.cooldownMs) current.status = "half-open";
    return { ...current };
  }

  canExecute(key, now = Date.now()) {
    return this.state(key, now).status !== "open";
  }

  recordSuccess(key) {
    this.states.set(key, { failures: 0, status: "closed", openedAt: 0 });
  }

  recordFailure(key, now = Date.now()) {
    const current = this.state(key, now);
    const failures = current.failures + 1;
    const status = failures >= this.failureThreshold ? "open" : "closed";
    this.states.set(key, { failures, status, openedAt: status === "open" ? now : 0 });
    return this.state(key, now);
  }
}

