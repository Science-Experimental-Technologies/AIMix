import { NextResponse } from "next/server";
import { appendAimixAudit, createAimixAsset, listAimixAssets } from "@/lib/db/index.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const url = new URL(request.url);
  const assets = await listAimixAssets(Object.fromEntries(["type", "name", "status", "environment"].map((key) => [key, url.searchParams.get(key)]).filter(([, value]) => value)));
  return NextResponse.json({ data: assets });
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.type || !body.name) return NextResponse.json({ error: "type and name are required" }, { status: 400 });
    const asset = await createAimixAsset(body);
    await appendAimixAudit({ actorType: "user", actorId: body.owner, action: "create", resourceType: body.type, resourceId: asset.id, outcome: "success", data: { name: body.name, version: asset.version } });
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

