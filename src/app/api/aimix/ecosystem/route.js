import { NextResponse } from "next/server";
import { UniversalEcosystemRegistry } from "@/aimix/ecosystem/catalog.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const url = new URL(request.url);
  const registry = new UniversalEcosystemRegistry();
  const filters = Object.fromEntries(["kind", "category", "status"].map((key) => [key, url.searchParams.get(key)]));
  return NextResponse.json({ summary: registry.summary(), entries: registry.list(filters) });
}
