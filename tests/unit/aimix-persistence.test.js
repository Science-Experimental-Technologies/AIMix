import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let tempDir;
const originalDataDir = process.env.DATA_DIR;

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aimix-db-"));
  process.env.DATA_DIR = tempDir;
  delete global._dbAdapter;
  vi.resetModules();
});

afterEach(() => {
  try { global._dbAdapter?.instance?.close?.(); } catch {}
  delete global._dbAdapter;
  fs.rmSync(tempDir, { recursive: true, force: true });
  if (originalDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = originalDataDir;
});

describe("AIMix persistence", () => {
  it("migrates fabric tables and persists assets, traces, memory, workflows, and audit", async () => {
    const db = await import("@/lib/db/index.js");
    await db.initDb();
    const asset = await db.createAimixAsset({ type: "routing-policy", name: "balanced", data: { objective: "balanced" } });
    expect((await db.listAimixAssets({ type: "routing-policy" }))[0].id).toBe(asset.id);

    await db.saveAimixTrace({ requestId: "req-1", status: "completed", candidates: [] });
    expect((await db.listAimixTraces())[0].requestId).toBe("req-1");

    await db.putAimixMemory({ scope: "project", scopeId: "p1", key: "style", data: { value: "concise" } });
    expect((await db.getAimixMemory("project", "p1"))[0].data.value).toBe("concise");

    await db.saveWorkflowRun({ workflowId: "wf", status: "running", idempotencyKey: "once", checkpoint: { completed: {} } });
    const event = await db.appendAimixAudit({ actorType: "user", actorId: "u1", action: "create", resourceType: "policy", resourceId: asset.id, outcome: "success" });
    expect(event.id).toBeDefined();
  });
});
