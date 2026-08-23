export class AIMixClient {
  constructor({ baseUrl = "http://localhost:20128", apiKey, fetch: fetchImpl = globalThis.fetch } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); this.apiKey = apiKey; this.fetch = fetchImpl;
  }
  async request(path, options = {}) {
    const response = await this.fetch(`${this.baseUrl}${path}`, { ...options, headers: { "content-type": "application/json", ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}), ...options.headers } });
    if (!response.ok) { const detail = await response.text(); throw new Error(`AIMix ${response.status}: ${detail}`); }
    return response.json();
  }
  chat(params, metadata = {}) { return this.request("/v1/chat/completions", { method: "POST", body: JSON.stringify({ ...params, metadata }) }); }
  models() { return this.request("/v1/models"); }
  plan(request, candidates, policy, metadata = {}) { return this.request("/api/aimix/decision", { method: "POST", body: JSON.stringify({ request, candidates, policy, metadata }) }); }
  simulate(input) { return this.request("/api/aimix/simulate", { method: "POST", body: JSON.stringify(input) }); }
  runWorkflow(workflow, options = {}) { return this.request("/api/aimix/workflows/run", { method: "POST", body: JSON.stringify({ workflow, ...options }) }); }
  doctor() { return this.request("/api/aimix/doctor"); }
}

