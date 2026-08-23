import { getCapabilitiesForModel } from "open-sse/providers/capabilities.js";
import { classifyRequest } from "../decision/classify.js";
import { createExecutionPlan } from "../decision/plan.js";
import { getModelInfo } from "@/sse/services/model.js";

function capabilityList(providerId, modelId) {
  const caps = getCapabilitiesForModel(providerId, modelId) || {};
  return [
    "text",
    ...(caps.vision ? ["image"] : []),
    ...(caps.tools !== false ? ["tools"] : []),
    "structured-output",
  ];
}

export async function rankAdaptiveCombo(models, body, policy = {}, runtimeByCandidate = {}) {
  const classification = classifyRequest(body, body?.metadata || {});
  const candidates = await Promise.all(models.map(async (modelId) => {
    const info = await getModelInfo(modelId);
    const capabilities = getCapabilitiesForModel(info.provider, info.model || modelId) || {};
    return {
      id: modelId,
      modelId: info.model || modelId,
      providerId: info.provider,
      capabilities: capabilityList(info.provider, info.model || modelId),
      contextWindow: capabilities.contextWindow,
      maxPrivacyLevel: policy.providerPrivacy?.[info.provider] || "internal",
      quality: policy.modelQuality?.[modelId] ?? 0.5,
      reliability: policy.providerReliability?.[info.provider] ?? 0.5,
      latencyMs: policy.modelLatencyMs?.[modelId] ?? 1000,
      estimatedCost: policy.modelEstimatedCost?.[modelId] ?? 0,
      privacyScore: policy.providerPrivacyScore?.[info.provider] ?? 0.5,
    };
  }));
  const plan = createExecutionPlan({ classification, request: classification, candidates, policy, runtimeByCandidate });
  return {
    models: plan.candidates.map(({ candidate }) => candidate.id),
    classification,
    plan,
  };
}
