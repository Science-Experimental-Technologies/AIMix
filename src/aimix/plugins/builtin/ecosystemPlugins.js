export const OPTIONAL_ECOSYSTEM_PLUGINS = Object.freeze([
  Object.freeze({
    id: "aimix.context.headroom",
    name: "Headroom Context Processor",
    version: "1.0.0",
    apiVersion: "1",
    type: "context-processor",
    optional: true,
    source: "https://github.com/headroomlabs-ai/headroom",
    license: "Apache-2.0",
    transport: { type: "mcp", command: "headroom", args: ["mcp"] },
    capabilities: ["compress", "retrieve", "stats", "reversible-compression"],
    permissions: ["subprocess"],
    secrets: [],
  }),
  Object.freeze({
    id: "aimix.context.rtk",
    name: "RTK Command Output Processor",
    version: "1.0.0",
    apiVersion: "1",
    type: "context-processor",
    optional: true,
    source: "https://github.com/rtk-ai/rtk",
    license: "Apache-2.0",
    transport: { type: "cli", command: "rtk", args: [] },
    capabilities: ["command-output-compression"],
    permissions: ["subprocess"],
    secrets: [],
  }),
  Object.freeze({
    id: "aimix.code.tokensave",
    name: "TokenSave Code Intelligence",
    version: "1.0.0",
    apiVersion: "1",
    type: "tool-adapter",
    optional: true,
    source: "https://github.com/aovestdipaperino/tokensave",
    license: "MIT",
    transport: { type: "mcp", command: "tokensave", args: ["mcp"] },
    capabilities: ["code-index", "symbol-search", "dependency-graph"],
    permissions: ["subprocess", "workspace-read"],
    secrets: [],
  }),
]);

export function registerOptionalEcosystemPlugins(registry) {
  return OPTIONAL_ECOSYSTEM_PLUGINS.map((plugin) => registry.register(plugin));
}
