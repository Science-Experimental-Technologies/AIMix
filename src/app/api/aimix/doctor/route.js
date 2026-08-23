import { NextResponse } from "next/server";
import { runDoctor } from "@/aimix/index.js";
import { getAdapter } from "@/lib/db/driver.js";
import { getProviderConnections, getSettings } from "@/lib/db/index.js";

export async function GET() {
  const providers = (await getProviderConnections()).map((connection) => ({ id: `${connection.provider}:${connection.id}`, connection }));
  const report = await runDoctor({ providers, checks: {
    database: async () => Boolean((await getAdapter()).get("SELECT 1 AS ok")?.ok),
    policy: async () => Boolean((await getSettings()).aimixRoutingPolicy),
    security: async () => { const settings = await getSettings(); return !settings.requireRequestSignature || Boolean(process.env.AIMIX_SIGNING_SECRET); },
    provider: async (provider) => provider.connection.isActive !== false,
  } });
  return NextResponse.json(report, { status: report.healthy ? 200 : 503 });
}

