import { createHash } from "node:crypto";

export function assignVariant(subjectId, experiment) {
  const variants = experiment.variants || []; const total = variants.reduce((sum, variant) => sum + (variant.weight || 0), 0);
  if (!variants.length || total <= 0) return null;
  const bucket = parseInt(createHash("sha256").update(`${experiment.id}:${subjectId}`).digest("hex").slice(0, 8), 16) / 0xffffffff * total;
  let cursor = 0; for (const variant of variants) { cursor += variant.weight || 0; if (bucket <= cursor) return variant; }
  return variants.at(-1);
}

export function compareVariants(observations = []) {
  const groups = new Map();
  for (const item of observations) {
    const group = groups.get(item.variant) || { variant: item.variant, count: 0, quality: 0, cost: 0, latency: 0, errors: 0 };
    group.count += 1; group.quality += Number(item.quality) || 0; group.cost += Number(item.cost) || 0; group.latency += Number(item.latency) || 0; group.errors += item.error ? 1 : 0; groups.set(item.variant, group);
  }
  return [...groups.values()].map((group) => ({ ...group, quality: group.quality / group.count, cost: group.cost / group.count, latency: group.latency / group.count, errorRate: group.errors / group.count }));
}

