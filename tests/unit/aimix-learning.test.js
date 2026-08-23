import { describe, expect, it } from "vitest";
import { advanceChangeProposal, assignVariant, authorizeRole, compareVariants, proposeRoutingChange, runArena } from "../../src/aimix/index.js";

describe("AIMix evaluation and governed learning", () => {
  it("runs an arena and ranks quality before cost", async () => {
    const result = await runArena({ task: "x", contestants: ["a", "b"], execute: async (id) => ({ output: id === "a" ? { ok: true } : {}, cost: id === "a" ? 2 : 1 }), criteria: { requiredFields: ["ok"] } });
    expect(result.winner.contestant).toBe("a");
  });
  it("assigns deterministic A/B variants and aggregates metrics", () => {
    const experiment = { id: "e", variants: [{ id: "a", weight: 50 }, { id: "b", weight: 50 }] };
    expect(assignVariant("user", experiment)).toEqual(assignVariant("user", experiment));
    expect(compareVariants([{ variant: "a", quality: 1, cost: 2 }, { variant: "a", quality: 0, cost: 4 }])[0]).toMatchObject({ quality: 0.5, cost: 3 });
  });
  it("requires the complete safeguarded promotion sequence", () => {
    let proposal = proposeRoutingChange({ baseline: { samples: 1000, quality: 0.9, cost: 2 }, candidate: { samples: 1000, quality: 0.9, cost: 1 }, minSamples: 10, confidenceThreshold: 0.9 });
    expect(proposal.status).toBe("proposed"); expect(proposal.productionEligible).toBe(false);
    for (const stage of ["simulate", "benchmark", "shadow", "ab-test"]) proposal = advanceChangeProposal(proposal, stage);
    proposal = advanceChangeProposal(proposal, "approve", { approver: "owner", reason: "validated" });
    proposal = advanceChangeProposal(proposal, "deploy"); proposal = advanceChangeProposal(proposal, "monitor");
    expect(proposal.productionEligible).toBe(true);
  });
  it("enforces RBAC", () => {
    expect(authorizeRole({ roles: ["auditor"], permission: "audit:read" }).allowed).toBe(true);
    expect(authorizeRole({ roles: ["viewer"], permission: "workflow:execute" }).allowed).toBe(false);
  });
});
