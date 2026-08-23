function interpolate(value, output) {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{([\w.-]+)\}\}/g, (_, path) => path.split(".").reduce((current, key) => current?.[key], output) ?? "");
}

export const builtinWorkflowHandlers = Object.freeze({
  Transform: async (node, output) => {
    if (node.config?.value !== undefined) return interpolate(node.config.value, output);
    return node.config || null;
  },
  Condition: async (node, output) => {
    const actual = node.config?.path?.split(".").reduce((current, key) => current?.[key], output);
    return { pass: actual === node.config?.equals, actual };
  },
  Delay: async (node) => {
    const duration = Math.min(5000, Math.max(0, Number(node.config?.milliseconds) || 0));
    await new Promise((resolve) => setTimeout(resolve, duration));
    return { delayedMs: duration };
  },
  End: async (_node, output) => ({ output }),
});

