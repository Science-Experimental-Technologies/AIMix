import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const VALID_SKILL_ID = /^aimix(?:-(?:chat|embeddings|image|stt|tts|video|web-fetch|web-search))?$/;

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!VALID_SKILL_ID.test(id)) return Response.json({ error: "Unknown skill" }, { status: 404 });

  try {
    const content = await fs.readFile(path.join(process.cwd(), "skills", id, "SKILL.md"), "utf8");
    return new Response(content, { headers: { "content-type": "text/markdown; charset=utf-8" } });
  } catch {
    return Response.json({ error: "Skill is unavailable" }, { status: 404 });
  }
}
