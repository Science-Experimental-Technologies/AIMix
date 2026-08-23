import { OPENAI_BLOCK } from "../schema/index.js";

// Collapse an all-text OpenAI content-part array into the string shape expected by
// text-only compatible endpoints. Preserve arrays containing any other modality.
export function collapseTextParts(parts) {
  return parts.length > 0 && parts.every(part => part.type === OPENAI_BLOCK.TEXT)
    ? parts.map(part => part.text || "").join("\n")
    : parts;
}
