export class ToolRegistry {
  constructor() { this.tools = new Map(); }
  register(tool) {
    if (!tool?.name || !tool.version || typeof tool.execute !== "function") throw new Error("Invalid tool definition");
    const key = `${tool.name}@${tool.version}`; if (this.tools.has(key)) throw new Error(`Tool already registered: ${key}`);
    this.tools.set(key, { riskLevel: "low", permissions: [], timeoutMs: 30000, ...tool }); return key;
  }
  resolve(name, version) { return this.tools.get(`${name}@${version}`) || null; }
  async execute(name, version, input, context = {}) {
    const tool = this.resolve(name, version); if (!tool) throw new Error("Tool not found");
    const permissions = new Set(context.permissions || []);
    if (tool.permissions.some((permission) => !permissions.has(permission) && !permissions.has("*"))) throw new Error("Tool permission denied");
    const errors = validateSchema(input, tool.inputSchema); if (errors.length) throw new Error(`Tool input invalid: ${errors.join(", ")}`);
    return Promise.race([tool.execute(input, context), new Promise((_, reject) => setTimeout(() => reject(new Error("Tool timeout")), tool.timeoutMs))]);
  }
}

function validateSchema(value, schema = {}) {
  const errors = []; if (schema.type === "object" && (value == null || typeof value !== "object" || Array.isArray(value))) return ["expected object"];
  for (const key of schema.required || []) if (!Object.hasOwn(value || {}, key)) errors.push(`missing ${key}`);
  for (const [key, definition] of Object.entries(schema.properties || {})) if (value?.[key] != null && definition.type && typeof value[key] !== definition.type) errors.push(`${key} must be ${definition.type}`);
  return errors;
}

