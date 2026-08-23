import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const content = await fs.readFile(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
    return new Response(content, { headers: { "content-type": "text/markdown; charset=utf-8" } });
  } catch {
    return Response.json({ error: "Changelog is unavailable" }, { status: 404 });
  }
}
