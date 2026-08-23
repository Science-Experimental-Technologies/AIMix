const TYPES = new Set(["provider-adapter", "model-adapter", "routing-strategy", "evaluator", "memory-backend", "context-processor", "tool-adapter", "agent", "security-policy", "observability-exporter", "workflow-node", "cli-extension", "transport-adapter", "protocol-adapter", "discovery-strategy", "capability-provider", "framework-adapter"]);

export class PluginRegistry {
  constructor({ apiVersion = "1" } = {}) { this.apiVersion = apiVersion; this.plugins = new Map(); }
  register(plugin) {
    if (!plugin?.id || !plugin.version || !TYPES.has(plugin.type)) throw new Error("Invalid plugin manifest");
    if (String(plugin.apiVersion) !== this.apiVersion) throw new Error(`Unsupported plugin API version: ${plugin.apiVersion}`);
    if (this.plugins.has(plugin.id)) throw new Error(`Plugin already registered: ${plugin.id}`);
    this.plugins.set(plugin.id, Object.freeze({ ...plugin })); return plugin;
  }
  get(id) { return this.plugins.get(id) || null; }
  list(type) { return [...this.plugins.values()].filter((plugin) => !type || plugin.type === type); }
  unregister(id) { return this.plugins.delete(id); }
}
