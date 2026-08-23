function validateWorkflow(workflow) {
  const nodes = new Map((workflow.nodes || []).map((node) => [node.id, node]));
  if (nodes.size !== (workflow.nodes || []).length) throw new Error("Duplicate workflow node id");
  for (const edge of workflow.edges || []) {
    if (!nodes.has(edge.from) || !nodes.has(edge.to)) throw new Error("Workflow edge references an unknown node");
  }
  return nodes;
}

export async function executeWorkflow(workflow, handlers, options = {}) {
  const nodes = validateWorkflow(workflow);
  const incoming = new Map([...nodes.keys()].map((id) => [id, 0]));
  const outgoing = new Map([...nodes.keys()].map((id) => [id, []]));
  for (const edge of workflow.edges || []) {
    incoming.set(edge.to, incoming.get(edge.to) + 1);
    outgoing.get(edge.from).push(edge.to);
  }
  const state = options.checkpoint ? structuredClone(options.checkpoint) : { completed: {}, failed: {}, output: {} };
  const queue = [...nodes.keys()].filter((id) => incoming.get(id) === 0);
  let visited = 0;
  while (queue.length) {
    const id = queue.shift();
    const node = nodes.get(id);
    visited += 1;
    if (!state.completed[id]) {
      const handler = handlers[node.type];
      if (!handler) throw new Error(`No handler for workflow node type: ${node.type}`);
      try {
        const result = await handler(node, state.output, options);
        state.completed[id] = { at: new Date().toISOString(), idempotencyKey: node.idempotencyKey || id };
        state.output[id] = result;
        await options.onCheckpoint?.(structuredClone(state));
      } catch (error) {
        state.failed[id] = { message: error.message, at: new Date().toISOString() };
        await options.onCheckpoint?.(structuredClone(state));
        if (!node.continueOnError) return { status: "failed", failedNode: id, state };
      }
    }
    for (const next of outgoing.get(id)) {
      incoming.set(next, incoming.get(next) - 1);
      if (incoming.get(next) === 0) queue.push(next);
    }
  }
  if (visited !== nodes.size) throw new Error("Workflow contains a cycle");
  return { status: "completed", state };
}

