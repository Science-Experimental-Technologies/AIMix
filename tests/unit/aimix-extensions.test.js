import { describe, expect, it } from "vitest";
import { ConfigurationTimeline, ToolRegistry, parseARL, retrieveKnowledge } from "../../src/aimix/index.js";

describe("AIMix extensions", () => {
  it("controls versioned tool execution", async () => {
    const registry = new ToolRegistry(); registry.register({ name: "read", version: "1", permissions: ["file:read"], inputSchema: { type: "object", required: ["path"], properties: { path: { type: "string" } } }, execute: async ({ path }) => path });
    await expect(registry.execute("read", "1", { path: "x" }, { permissions: ["file:read"] })).resolves.toBe("x");
    await expect(registry.execute("read", "1", {}, { permissions: ["file:read"] })).rejects.toThrow(/missing path/);
  });
  it("retrieves, filters, reranks, deduplicates, and cites knowledge", () => {
    const results = retrieveKnowledge("routing privacy", [{ id: "1", text: "routing privacy policy", metadata: { project: "a" } }, { id: "2", text: "routing privacy policy", metadata: { project: "a" } }, { id: "3", text: "unrelated", metadata: { project: "b" } }], { filter: { project: "a" } });
    expect(results).toHaveLength(1); expect(results[0].citation.index).toBe(1);
  });
  it("versions, diffs, and rolls back configuration", () => {
    const timeline = new ConfigurationTimeline(); timeline.commit({ objective: "cost" }, { at: "a" }); timeline.commit({ objective: "quality" }, { at: "b" });
    expect(timeline.diff(1, 2)[0].key).toBe("objective"); expect(timeline.rollback(1).config.objective).toBe("cost");
  });
  it("parses precise routing policy DSL", () => {
    expect(parseARL("objective privacy-first\nallow-provider local\nmax-cost 0.25")).toMatchObject({ objective: "privacy-first", allowedProviders: ["local"], hardRequestCost: 0.25 });
  });
});
