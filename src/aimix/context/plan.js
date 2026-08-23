const PRIORITY = Object.freeze({ system: 100, developer: 90, user: 80, assistant: 50, tool: 35 });

export function createContextPlan(messages = [], { maxTokens = 128000, reserveTokens = 4096 } = {}) {
  const budget = Math.max(0, maxTokens - reserveTokens);
  const items = messages.map((message, index) => {
    const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content ?? "");
    return { index, message, tokens: Math.ceil(content.length / 4), priority: PRIORITY[message.role] ?? 40 };
  });
  let used = items.reduce((sum, item) => sum + item.tokens, 0);
  const dropped = [];
  for (const item of [...items].sort((a, b) => a.priority - b.priority || a.index - b.index)) {
    if (used <= budget) break;
    if (item.message.role === "system" || item.message.role === "developer") continue;
    item.dropped = true;
    used -= item.tokens;
    dropped.push({ index: item.index, role: item.message.role, tokens: item.tokens, reason: "context_budget" });
  }
  return {
    messages: items.filter((item) => !item.dropped).sort((a, b) => a.index - b.index).map((item) => item.message),
    estimatedTokens: used,
    budget,
    dropped,
    valid: used <= budget,
  };
}

