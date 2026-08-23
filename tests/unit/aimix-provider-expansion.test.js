import { describe, expect, it } from "vitest";
import registry from "../../open-sse/providers/registry/index.js";

const byId = Object.fromEntries(registry.map((provider) => [provider.id, provider]));

describe("AIMix expanded provider catalog", () => {
  it("registers the new hosted inference platforms with unique ids", () => {
    const ids = registry.map((provider) => provider.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ["aimlapi", "baseten", "deepinfra", "huggingface", "modal", "novita", "scaleway"]) {
      expect(byId[id]).toBeDefined();
    }
  });

  it("exposes complete OpenAI-compatible transport endpoints", () => {
    for (const id of ["aimlapi", "baseten", "deepinfra", "huggingface", "modal", "novita", "scaleway"]) {
      expect(byId[id].transport.baseUrl).toMatch(/^https:\/\/.+\/chat\/completions$/);
      expect(byId[id].transport.validateUrl).toMatch(/^https:\/\/.+\/models$/);
    }
  });

  it("allows live catalog models without hardcoding every model id", () => {
    for (const id of ["aimlapi", "baseten", "deepinfra", "huggingface", "modal", "novita", "scaleway"]) {
      expect(byId[id].modelsFetcher?.type).toBe("openai");
      expect(byId[id].passthroughModels).toBe(true);
    }
  });
});
