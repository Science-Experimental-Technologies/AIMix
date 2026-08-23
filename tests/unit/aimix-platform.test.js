import { describe, expect, it, vi } from "vitest";
import { authorizeAgentAction, evaluateOutput, executeWorkflow, simulateTopology } from "../../src/aimix/index.js";

describe("AIMix platform controls", () => {
  it("requires approval for a permitted but risky agent action", () => {
    const result = authorizeAgentAction({
      agent: { permissions: ["repo:write"] },
      action: { resource: "repo", operation: "write", environment: "production", riskFactors: ["write", "network"] },
      policy: { allowedEnvironments: ["production"], approvalRiskThreshold: 60 },
    });
    expect(result.decision).toBe("require-approval");
  });

  it("executes a DAG and emits recoverable checkpoints", async () => {
    const onCheckpoint = vi.fn();
    const workflow = { nodes: [{ id: "a", type: "transform" }, { id: "b", type: "transform" }], edges: [{ from: "a", to: "b" }] };
    const result = await executeWorkflow(workflow, { transform: async (node, output) => `${node.id}:${output.a || "start"}` }, { onCheckpoint });
    expect(result.status).toBe("completed");
    expect(result.state.output.b).toBe("b:a:start");
    expect(onCheckpoint).toHaveBeenCalledTimes(2);
  });

  it("evaluates deterministic output criteria", () => {
    expect(evaluateOutput({ id: 1, name: "A" }, { requiredFields: ["id", "name"] }).pass).toBe(true);
  });

  it("simulates provider failure and fallback distribution", () => {
    const result = simulateTopology({
      workload: [{ count: 10, tokens: 100, requiredCapabilities: ["text"] }],
      providers: [
        { id: "a", capabilities: ["text"], costPerToken: 0.001, latencyMs: 10 },
        { id: "b", capabilities: ["text"], costPerToken: 0.002, latencyMs: 20 },
      ],
      scenario: { failedProviders: ["a"] },
    });
    expect(result.distribution).toEqual({ b: 10 });
  });
});
