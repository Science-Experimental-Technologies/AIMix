function normalize(value) { return String(value || "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim(); }

export function optimizeContext(messages = [], { mode = "balanced" } = {}) {
  if (mode === "maximum-preservation" || mode === "full") return { messages: structuredClone(messages), removed: [], savedCharacters: 0 };
  const seen = new Set(); const removed = []; let savedCharacters = 0;
  const optimized = [];
  messages.forEach((message, index) => {
    const content = typeof message.content === "string" ? normalize(message.content) : message.content;
    const fingerprint = `${message.role}:${JSON.stringify(content)}`;
    if (seen.has(fingerprint) && !["system", "developer"].includes(message.role)) {
      removed.push({ index, reason: "duplicate" }); savedCharacters += JSON.stringify(message.content).length; return;
    }
    seen.add(fingerprint);
    let next = { ...message, content };
    if (mode === "minimal" && message.role === "tool" && typeof content === "string" && content.length > 2000) {
      next = { ...next, content: `${content.slice(0, 1500)}\n...[truncated ${content.length - 2000} chars]...\n${content.slice(-500)}` };
      savedCharacters += content.length - next.content.length;
    }
    optimized.push(next);
  });
  return { messages: optimized, removed, savedCharacters };
}

