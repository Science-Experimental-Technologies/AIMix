import { describe, expect, it } from "vitest";
import {
  CircuitBreaker,
  classifyExecutionError,
  classifyRequest,
  createContextPlan,
  createDecisionTrace,
  createExecutionPlan,
  enforceBudget,
} from "../../src/aimix/index.js";

const request = {
  taskType: "coding",
  estimatedTokens: 1000,
  modalities: ["text"],
  requiresTools: true,
  requiresStructuredOutput: false,
  privacyLevel: "private",
};

describe("AIMix decision engine", () => {
  it("classifies coding, tools, modality, and complexity", () => {
    const result = classifyRequest({ messages: [{ role: "user", content: "Debug this function" }], tools: [{}] });
    expect(result).toMatchObject({ taskType: "coding", requiresTools: true, modalities: ["text"], complexity: "high" });
  });

  it("filters hard constraints before scoring and explains the decision", () => {
    const candidates = [
      { id: "cheap", providerId: "public", modelId: "small", capabilities: ["text", "tools"], maxPrivacyLevel: "public" },
      { id: "private", providerId: "local", modelId: "code", capabilities: ["text", "tools"], maxPrivacyLevel: "sensitive", quality: 0.8 },
    ];
    const plan = createExecutionPlan({ request, candidates, policy: { objective: "quality-first" } });
    expect(plan.selected.id).toBe("private");
    expect(plan.rejected[0].code).toBe("privacy_mismatch");
    const trace = createDecisionTrace({ requestId: "req-1", classification: request, plan });
    expect(trace.decisionReason).toBe("highest_weighted_score_after_hard_constraints");
  });

  it("classifies errors into safe recovery actions", () => {
    expect(classifyExecutionError({ status: 429 }).action).toBe("alternate-account");
    expect(classifyExecutionError({ message: "maximum context length exceeded" }).action).toBe("optimize-context");
    expect(classifyExecutionError({ status: 400 }).retryable).toBe(false);
  });

  it("opens and half-opens a circuit", () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 10 });
    breaker.recordFailure("p", 0);
    expect(breaker.recordFailure("p", 1).status).toBe("open");
    expect(breaker.canExecute("p", 5)).toBe(false);
    expect(breaker.state("p", 12).status).toBe("half-open");
  });

  it("enforces hard budgets", () => {
    expect(enforceBudget({ estimatedCost: 3, spent: 8, budget: { limit: 10, enforcement: "hard" } })).toMatchObject({ allowed: false, reason: "hard_budget_exceeded" });
  });

  it("drops low-priority context before instructions", () => {
    const plan = createContextPlan([
      { role: "system", content: "keep" },
      { role: "tool", content: "x".repeat(200) },
      { role: "user", content: "question" },
    ], { maxTokens: 30, reserveTokens: 0 });
    expect(plan.messages.some((message) => message.role === "system")).toBe(true);
    expect(plan.dropped[0].role).toBe("tool");
  });
});
