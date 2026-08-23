import { evaluateOutput } from "./evaluate.js";

export async function runArena({ task, contestants = [], execute, criteria = {} }) {
  const results = await Promise.all(contestants.map(async (contestant) => {
    const started = performance.now();
    try {
      const response = await execute(contestant, task); const latencyMs = performance.now() - started;
      const evaluation = evaluateOutput(response.output, criteria);
      return { contestant, status: "success", output: response.output, usage: response.usage || {}, cost: response.cost || 0, latencyMs, evaluation };
    } catch (error) { return { contestant, status: "failed", error: error.message, latencyMs: performance.now() - started, evaluation: { pass: false, score: 0 } }; }
  }));
  results.sort((a, b) => b.evaluation.score - a.evaluation.score || a.cost - b.cost || a.latencyMs - b.latencyMs);
  return { winner: results[0] || null, results };
}

