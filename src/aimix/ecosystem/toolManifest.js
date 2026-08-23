const TRANSPORTS = new Set(["native", "http", "rest", "sse", "websocket", "grpc", "stdio", "cli", "mcp", "a2a", "openapi"]);

export function validateToolManifest(input) {
  const errors = [];
  if (!input?.id || !/^[a-z0-9][a-z0-9._-]*$/.test(input.id)) errors.push("id must be a lowercase stable identifier");
  if (!input?.name) errors.push("name is required");
  if (!input?.version) errors.push("version is required");
  if (!TRANSPORTS.has(input?.transport?.type)) errors.push("unsupported transport type");
  if (!Array.isArray(input?.capabilities) || input.capabilities.length === 0) errors.push("at least one capability is required");
  if (input?.inputSchema && input.inputSchema.type !== "object") errors.push("inputSchema must be an object schema");
  if (input?.permissions && !Array.isArray(input.permissions)) errors.push("permissions must be an array");
  if (input?.secrets && !Array.isArray(input.secrets)) errors.push("secrets must be an array");
  return { valid: errors.length === 0, errors };
}

export function createToolManifest(input) {
  const validation = validateToolManifest(input);
  if (!validation.valid) throw new Error(`Invalid tool manifest: ${validation.errors.join("; ")}`);
  return Object.freeze({
    permissions: [], secrets: [], cost: null, latency: null, reliability: null,
    health: "unknown", license: null, source: null, outputSchema: null, ...input,
    capabilities: Object.freeze([...new Set(input.capabilities)]),
  });
}
