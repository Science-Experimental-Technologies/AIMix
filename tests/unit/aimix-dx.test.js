import { describe, expect, it, vi } from "vitest";
import { PluginRegistry, runDoctor } from "../../src/aimix/index.js";
import { AIMixClient } from "../../sdk/javascript/index.js";

describe("AIMix DX", () => {
  it("validates plugin contracts", () => {
    const registry = new PluginRegistry(); registry.register({ id: "x", version: "1.0.0", apiVersion: "1", type: "evaluator" });
    expect(registry.list("evaluator")).toHaveLength(1);
    expect(() => registry.register({ id: "bad", version: "1", apiVersion: "2", type: "evaluator" })).toThrow(/Unsupported/);
  });
  it("reports doctor failures with remediation", async () => {
    const report = await runDoctor({ checks: { database: async () => { throw new Error("offline"); } } });
    expect(report.healthy).toBe(false); expect(report.remediation[0].check).toBe("database");
  });
  it("provides an OpenAI-compatible SDK client", async () => {
    const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ data: [] }) }));
    const client = new AIMixClient({ baseUrl: "http://localhost:1/", apiKey: "key", fetch }); await client.models();
    expect(fetch).toHaveBeenCalledWith("http://localhost:1/v1/models", expect.objectContaining({ headers: expect.objectContaining({ authorization: "Bearer key" }) }));
  });
});
