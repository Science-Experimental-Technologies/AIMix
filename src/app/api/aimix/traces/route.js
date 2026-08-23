import { NextResponse } from "next/server";
import { listAimixTraces } from "@/lib/db/index.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const url = new URL(request.url);
  const data = await listAimixTraces({ limit: url.searchParams.get("limit"), projectId: url.searchParams.get("projectId"), environment: url.searchParams.get("environment") });
  return NextResponse.json({ data });
}

