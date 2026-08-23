import { NextResponse } from "next/server";
import { appendAimixAudit, getAimixMemory, putAimixMemory } from "@/lib/db/index.js";

export const dynamic = "force-dynamic";
const SCOPES = new Set(["global", "user", "project", "session", "agent", "workflow", "temporary"]);

export async function GET(request) {
  const url = new URL(request.url); const scope = url.searchParams.get("scope"); const scopeId = url.searchParams.get("scopeId");
  if (!SCOPES.has(scope) || !scopeId) return NextResponse.json({ error: "valid scope and scopeId are required" }, { status: 400 });
  return NextResponse.json({ data: await getAimixMemory(scope, scopeId) });
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!SCOPES.has(body.scope) || !body.scopeId || !body.key) return NextResponse.json({ error: "valid scope, scopeId, and key are required" }, { status: 400 });
    const entry = await putAimixMemory(body);
    await appendAimixAudit({ actorType: "user", actorId: body.actorId, action: "write", resourceType: "memory", resourceId: entry.id, outcome: "success", data: { scope: body.scope, scopeId: body.scopeId, key: body.key } });
    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

