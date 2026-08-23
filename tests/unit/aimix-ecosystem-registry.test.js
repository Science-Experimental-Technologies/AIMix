import { describe, expect, it } from "vitest";
import { UniversalEcosystemRegistry } from "../../src/aimix/ecosystem/catalog.js";
import { buildDiscoveryPlan, profileEndpoint } from "../../src/aimix/ecosystem/discovery.js";
import { createToolManifest, validateToolManifest } from "../../src/aimix/ecosystem/toolManifest.js";
import { applySmartProfile, listSmartProfiles } from "../../src/aimix/context/smartProfiles.js";
import { PluginRegistry } from "../../src/aimix/plugins/registry.js";
import { OPTIONAL_ECOSYSTEM_PLUGINS, registerOptionalEcosystemPlugins } from "../../src/aimix/plugins/builtin/ecosystemPlugins.js";

describe("Universal AI Ecosystem Registry", () => {
  it("ships a large lifecycle-aware catalog without duplicate ids", () => {
    const registry = new UniversalEcosystemRegistry();
    const summary = registry.summary();
    expect(summary.total).toBeGreaterThanOrEqual(150);
    expect(summary.byKind.provider).toBeGreaterThan(70);
    expect(summary.byStatus.supported).toBeGreaterThan(30);
    expect(registry.list({ category: "context-processor" }).map((entry) => entry.id)).toContain("headroom");
  });

  it("builds non-mutating endpoint discovery plans and profiles observations", () => {
    const plan = buildDiscoveryPlan("http://localhost:8000");
    expect(plan.some((probe) => probe.url === "http://localhost:8000/v1/models")).toBe(true);
    const result = profileEndpoint([{ ok: true, url: "http://localhost:8000/v1/models", body: { object: "list", data: [] } }]);
    expect(result.protocol).toBe("openai");
    expect(result.capabilities).toContain("models");
  });

  it("validates transport-neutral tool manifests", () => {
    expect(validateToolManifest({}).valid).toBe(false);
    const manifest = createToolManifest({ id: "example.search", name: "Example Search", version: "1.0.0", transport: { type: "mcp" }, capabilities: ["search", "search"] });
    expect(manifest.capabilities).toEqual(["search"]);
  });

  it("registers external integrations as optional plugins without core dependencies", () => {
    const registry = new PluginRegistry();
    registerOptionalEcosystemPlugins(registry);
    expect(registry.list()).toHaveLength(3);
    expect(OPTIONAL_ECOSYSTEM_PLUGINS.every((plugin) => plugin.optional && plugin.source && plugin.license)).toBe(true);
  });
});

describe("AIMix Smart Profiles", () => {
  it("exposes terse profiles and injects one idempotently", () => {
    expect(listSmartProfiles().map((profile) => profile.id)).toContain("terse");
    const first = applySmartProfile([{ role: "user", content: "Explain" }], "terse");
    const second = applySmartProfile(first.messages, "terse");
    expect(first.applied).toBe(true);
    expect(second.messages).toEqual(first.messages);
  });
});
