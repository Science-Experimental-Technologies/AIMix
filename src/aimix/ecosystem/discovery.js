const DETECTORS = Object.freeze([
  { id: "openai", paths: ["/v1/models"], signatures: ["data", "object"] },
  { id: "anthropic", paths: ["/v1/messages"], signatures: ["anthropic-version"] },
  { id: "ollama", paths: ["/api/tags"], signatures: ["models"] },
  { id: "lm-studio", paths: ["/api/v1/models", "/v1/models"], signatures: ["loaded_instances"] },
  { id: "tgi", paths: ["/info", "/v1/models"], signatures: ["model_id"] },
  { id: "openapi", paths: ["/openapi.json"], signatures: ["openapi", "paths"] },
  { id: "mcp", paths: ["/.well-known/mcp", "/mcp"], signatures: ["tools"] },
]);

export function buildDiscoveryPlan(baseUrl) {
  const base = new URL(baseUrl);
  if (!["http:", "https:"].includes(base.protocol)) throw new Error("Discovery only supports HTTP(S)");
  return DETECTORS.flatMap((detector) => detector.paths.map((path) => ({ detector: detector.id, method: "GET", url: new URL(path, base).toString() })));
}

export function profileEndpoint(observations = []) {
  const successful = observations.filter((item) => item && item.ok);
  const text = JSON.stringify(successful.map((item) => item.body || item.headers || {})).toLowerCase();
  const scores = DETECTORS.map((detector) => ({
    detector: detector.id,
    score: detector.signatures.reduce((sum, signature) => sum + (text.includes(signature) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);
  const paths = new Set(successful.map((item) => new URL(item.url).pathname));
  const capabilities = [];
  if (paths.has("/v1/models")) capabilities.push("models");
  if (observations.some((item) => item.capability === "streaming" && item.ok)) capabilities.push("streaming");
  if (observations.some((item) => item.capability === "tool-calling" && item.ok)) capabilities.push("tool-calling");
  if (observations.some((item) => item.capability === "vision" && item.ok)) capabilities.push("vision");
  if (observations.some((item) => item.capability === "embedding" && item.ok)) capabilities.push("embedding");
  return { protocol: scores[0]?.score ? scores[0].detector : "unknown", confidence: scores[0]?.score || 0, capabilities, evidenceCount: successful.length };
}
