import { classifyExecutionError } from "./errors.js";

export function nextFallback(graph, currentId, error, visited = new Set()) {
  const classification = classifyExecutionError(error); const edges = graph.edges?.filter((edge) => edge.from === currentId) || [];
  const eligible = edges.filter((edge) => !visited.has(edge.to) && (!edge.on?.length || edge.on.includes(classification.type) || edge.on.includes("*")))
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  const edge = eligible[0];
  return edge ? { node: graph.nodes?.find((node) => node.id === edge.to) || null, edge, classification } : { node: null, edge: null, classification };
}

export function buildFallbackPath(graph, startId, failures = []) {
  const path = [startId]; const reasons = []; const visited = new Set(path); let current = startId;
  for (const failure of failures) { const next = nextFallback(graph, current, failure, visited); reasons.push({ from: current, to: next.node?.id || null, error: next.classification.type, action: next.classification.action }); if (!next.node) break; current = next.node.id; path.push(current); visited.add(current); }
  return { path, reasons };
}

