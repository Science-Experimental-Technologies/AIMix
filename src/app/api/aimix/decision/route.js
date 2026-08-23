import { NextResponse } from "next/server";
import { classifyRequest, createDecisionTrace, createExecutionPlan } from "@/aimix/index.js";
import { appendAimixAudit, getSettings, saveAimixTrace } from "@/lib/db/index.js";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const input = await request.json();
    const settings = await getSettings();
    const classification = classifyRequest(input.request || {}, input.metadata || {});
    const policy = input.policy || settings.aimixRoutingPolicy || {};
    const plan = createExecutionPlan({
      request: classification,
      candidates: input.candidates || [],
      policy,
      runtimeByCandidate: input.runtimeByCandidate || {},
    });
    const trace = createDecisionTrace({
      requestId: input.requestId || randomUUID(),
      classification,
      plan,
      policyId: policy.id || null,
    });
    await saveAimixTrace({ ...trace, projectId: input.metadata?.projectId, environment: input.metadata?.environment, status: plan.selected ? "planned" : "rejected" });
    await appendAimixAudit({ actorType: "api-key", actorId: input.metadata?.userId, action: "plan", resourceType: "request", resourceId: trace.requestId, outcome: plan.selected ? "success" : "denied", data: { selectedRoute: trace.selectedRoute, rejected: trace.rejected.length } });
    return NextResponse.json({ classification, plan, trace });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
