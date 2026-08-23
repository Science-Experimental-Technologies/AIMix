import { NextResponse } from "next/server";
import { detectAnomalies, forecastBudget } from "@/aimix/index.js";

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ budget: forecastBudget(body.samples || [], body.options || {}), anomalies: detectAnomalies(body.samples || [], body.anomalyOptions || {}) });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 400 }); }
}

