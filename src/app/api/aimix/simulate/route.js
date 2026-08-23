import { NextResponse } from "next/server";
import { simulateTopology } from "@/aimix/index.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const input = await request.json();
    return NextResponse.json(simulateTopology(input));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
