import { NextResponse } from "next/server";
import { executeWorkflow } from "@/aimix/index.js";
import { builtinWorkflowHandlers } from "@/aimix/workflow/handlers.js";
import { appendAimixAudit, saveWorkflowRun } from "@/lib/db/index.js";
import { randomUUID } from "node:crypto";

export async function POST(request) {
  try {
    const body = await request.json(); const runId = body.runId || randomUUID();
    const result = await executeWorkflow(body.workflow, builtinWorkflowHandlers, {
      checkpoint: body.checkpoint,
      onCheckpoint: (checkpoint) => saveWorkflowRun({ id: runId, workflowId: body.workflow.id, status: "running", idempotencyKey: body.idempotencyKey, checkpoint }),
    });
    await saveWorkflowRun({ id: runId, workflowId: body.workflow.id, status: result.status, idempotencyKey: body.idempotencyKey, checkpoint: result.state });
    await appendAimixAudit({ actorType: "agent", actorId: body.agentId, action: "execute", resourceType: "workflow", resourceId: body.workflow.id, outcome: result.status, data: { runId } });
    return NextResponse.json({ runId, ...result }, { status: result.status === "failed" ? 422 : 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
