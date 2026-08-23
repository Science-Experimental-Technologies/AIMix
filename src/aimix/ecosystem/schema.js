export const ECOSYSTEM_STATUSES = Object.freeze([
  "discovered",
  "verified",
  "planned",
  "experimental",
  "implementing",
  "supported",
  "deprecated",
  "broken",
]);

export const ECOSYSTEM_KINDS = Object.freeze([
  "provider",
  "tool",
  "platform",
  "protocol",
  "framework",
  "exporter",
  "connector",
]);

const STATUS_SET = new Set(ECOSYSTEM_STATUSES);
const KIND_SET = new Set(ECOSYSTEM_KINDS);

export function validateEcosystemEntry(entry) {
  if (!entry || typeof entry !== "object") return "entry must be an object";
  if (typeof entry.id !== "string" || !entry.id.trim()) return "id must be a non-empty string";
  if (!KIND_SET.has(entry.kind)) return `unknown kind: ${entry.kind}`;
  if (typeof entry.category !== "string" || !entry.category.trim()) return "category must be a non-empty string";
  if (!STATUS_SET.has(entry.status)) return `unknown status: ${entry.status}`;
  return null;
}

export function createEcosystemEntry(id, kind, category, status, source, extra = {}) {
  const entry = {
    id,
    name: extra.name || id,
    kind,
    category,
    status,
    source,
    license: extra.license || null,
    capabilities: extra.capabilities || [],
    integration: extra.integration || "plugin",
    ...extra,
  };
  const error = validateEcosystemEntry(entry);
  if (error) throw new Error(`Invalid ecosystem manifest '${id}': ${error}`);
  return Object.freeze(entry);
}
