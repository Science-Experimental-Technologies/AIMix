export function enforceBudget({ estimatedCost = 0, spent = 0, budget = {} }) {
  const projected = spent + estimatedCost;
  const limit = Number(budget.limit);
  if (!Number.isFinite(limit) || limit < 0) return { allowed: true, projected, utilization: 0 };
  const utilization = limit === 0 ? Infinity : projected / limit;
  if (budget.enforcement === "hard" && projected > limit) {
    return { allowed: false, projected, utilization, reason: "hard_budget_exceeded" };
  }
  const threshold = Number(budget.alertThreshold ?? 0.8);
  return { allowed: true, projected, utilization, alert: utilization >= threshold };
}

