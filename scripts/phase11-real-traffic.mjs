#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const execute = process.argv.includes("--execute");
const baseUrl = (process.env.AIMIX_E2E_BASE_URL || "http://localhost:20128").replace(/\/$/, "");
const apiKey = process.env.AIMIX_E2E_API_KEY || "";
const models = String(process.env.AIMIX_E2E_MODELS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const budgetCapUsd = Number(process.env.AIMIX_E2E_BUDGET_CAP_USD || "0");
const freeOnly = process.env.AIMIX_E2E_FREE_ONLY === "true";
const maxRequests = Number(process.env.AIMIX_E2E_MAX_REQUESTS || "30");
const outputFile = path.resolve(process.env.AIMIX_E2E_REPORT || "artifacts/phase11-real-traffic.json");

if (!Number.isFinite(budgetCapUsd) || budgetCapUsd < 0 || budgetCapUsd > 2) {
  throw new Error("AIMIX_E2E_BUDGET_CAP_USD must be between 0 and 2");
}
if (!Number.isInteger(maxRequests) || maxRequests < 1 || maxRequests > 30) {
  throw new Error("AIMIX_E2E_MAX_REQUESTS must be an integer between 1 and 30");
}

const plan = {
  execute,
  baseUrl,
  modelCount: models.length,
  models,
  budgetCapUsd,
  freeOnly,
  maxRequests,
  credentialsPresent: Boolean(apiKey),
  scenarios: ["basic", "streaming", "tool-calling", "concurrent-identical"],
};

if (!execute) {
  console.log(JSON.stringify({ mode: "dry-run", plan }, null, 2));
  process.exit(0);
}
if (models.length < 2) throw new Error("AIMIX_E2E_MODELS must contain at least two configured model IDs");
if (budgetCapUsd <= 0 && !freeOnly) {
  throw new Error("Set a positive AIMIX_E2E_BUDGET_CAP_USD or explicitly enable AIMIX_E2E_FREE_ONLY=true");
}
if (freeOnly && models.some((model) => !/(?:^|\/)(?:[^/]*-free|[^/]*:free|kilo-auto\/free)$/i.test(model))) {
  throw new Error("AIMIX_E2E_FREE_ONLY only accepts model IDs explicitly marked free");
}

const headers = { "content-type": "application/json" };
if (apiKey) headers.authorization = `Bearer ${apiKey}`;

let requestCount = 0;
const results = [];

function reserveRequest() {
  requestCount += 1;
  if (requestCount > maxRequests) throw new Error(`Request cap exceeded (${maxRequests})`);
}

async function requestJson(model, body, scenario) {
  reserveRequest();
  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, ...body }),
  });
  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = { rawPreview: text.slice(0, 500) }; }
  return {
    scenario,
    model,
    status: response.status,
    ok: response.ok,
    latencyMs: Math.round(performance.now() - startedAt),
    requestId: response.headers.get("x-request-id"),
    usage: payload?.usage || null,
    finishReason: payload?.choices?.[0]?.finish_reason || null,
    error: response.ok ? null : payload?.error || payload,
  };
}

async function requestStream(model) {
  reserveRequest();
  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, stream: true, max_tokens: 24, messages: [{ role: "user", content: "Reply exactly: AIMIX_STREAM_OK" }] }),
  });
  const reader = response.body?.getReader();
  let chunks = 0;
  let bytes = 0;
  let firstChunkMs = null;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (firstChunkMs === null) firstChunkMs = Math.round(performance.now() - startedAt);
      chunks += 1;
      bytes += value.byteLength;
    }
  }
  return {
    scenario: "streaming",
    model,
    status: response.status,
    ok: response.ok && chunks > 0,
    latencyMs: Math.round(performance.now() - startedAt),
    firstChunkMs,
    chunks,
    bytes,
    requestId: response.headers.get("x-request-id"),
  };
}

for (const model of models) {
  results.push(await requestJson(model, {
    stream: false,
    max_tokens: 24,
    messages: [{ role: "user", content: "Reply exactly: AIMIX_BASIC_OK" }],
  }, "basic"));
  results.push(await requestStream(model));
  results.push(await requestJson(model, {
    stream: false,
    max_tokens: 64,
    messages: [{ role: "user", content: "What is the weather in Jakarta? Use the tool." }],
    tools: [{ type: "function", function: { name: "get_weather", description: "Read weather", parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] } } }],
    tool_choice: "auto",
  }, "tool-calling"));
}

const concurrentModel = models[0];
const identicalBody = {
  stream: false,
  max_tokens: 24,
  messages: [{ role: "user", content: "Reply exactly: AIMIX_COALESCE_OK" }],
};
results.push(...await Promise.all([
  requestJson(concurrentModel, identicalBody, "concurrent-identical"),
  requestJson(concurrentModel, identicalBody, "concurrent-identical"),
]));

const report = {
  generatedAt: new Date().toISOString(),
  plan,
  requestCount,
  summary: {
    passed: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
  },
  results,
};

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
