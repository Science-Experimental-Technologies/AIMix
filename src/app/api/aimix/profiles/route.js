import { NextResponse } from "next/server";
import { listSmartProfiles } from "@/aimix/context/smartProfiles.js";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ profiles: listSmartProfiles() });
}
