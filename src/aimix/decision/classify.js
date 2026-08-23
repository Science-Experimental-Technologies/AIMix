import { detectDataSensitivity } from "../security/dataClassification.js";

const CODE_RE = /```|\b(function|class|const|let|var|import|stack trace|exception|bug|debug|compile|test)\b/i;
const REASON_RE = /\b(reason|prove|analy[sz]e|compare|trade-?off|why|derive|plan)\b/i;
const EXTRACT_RE = /\b(extract|parse|fields?|schema|json|entities)\b/i;

function contentText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((part) => part?.text || part?.content || "").join(" ");
}

export function classifyRequest(body = {}, metadata = {}) {
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const text = messages.map((message) => contentText(message.content)).join("\n");
  const hasImages = messages.some((message) => Array.isArray(message.content)
    && message.content.some((part) => ["image", "image_url", "input_image"].includes(part?.type)));
  const hasTools = Array.isArray(body.tools) && body.tools.length > 0;
  const estimatedTokens = Math.ceil(text.length / 4);

  let taskType = "general";
  if (CODE_RE.test(text)) taskType = "coding";
  else if (EXTRACT_RE.test(text) || body.response_format) taskType = "extraction";
  else if (REASON_RE.test(text)) taskType = "reasoning";
  else if (text.length > 12000) taskType = "long-context";

  const complexity = estimatedTokens > 12000 || hasTools ? "high"
    : estimatedTokens > 2500 || REASON_RE.test(text) ? "medium" : "low";

  const sensitivity = detectDataSensitivity(text);
  const privacyOrder = { public: 0, internal: 1, private: 2, sensitive: 3 };
  const requestedPrivacy = metadata.privacyLevel || "internal";
  const privacyLevel = (privacyOrder[sensitivity.level] || 0) >= (privacyOrder[requestedPrivacy] || 0) ? sensitivity.level : requestedPrivacy;
  return {
    taskType,
    complexity,
    estimatedTokens,
    modalities: hasImages ? ["text", "image"] : ["text"],
    requiresTools: hasTools,
    requiresStructuredOutput: Boolean(body.response_format),
    privacyLevel,
    sensitivityFindings: sensitivity.findings,
    latencySensitivity: metadata.latencySensitivity || "normal",
  };
}
