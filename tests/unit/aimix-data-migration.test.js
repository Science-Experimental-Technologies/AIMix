import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const ORIGINAL_APPDATA = process.env.APPDATA;
const temporaryRoots = [];

afterEach(() => {
  if (ORIGINAL_APPDATA === undefined) delete process.env.APPDATA;
  else process.env.APPDATA = ORIGINAL_APPDATA;
  for (const root of temporaryRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

async function loadDataDir(root) {
  process.env.APPDATA = root;
  delete process.env.DATA_DIR;
  const moduleUrl = new URL("../../src/lib/dataDir.js", import.meta.url);
  moduleUrl.searchParams.set("test", `${Date.now()}-${Math.random()}`);
  return import(moduleUrl.href);
}

describe("AIMix data-root migration", () => {
  it.runIf(process.platform === "win32")("copies legacy state without deleting the source", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aimix-migration-"));
    temporaryRoots.push(root);
    const legacyName = ["9", "router"].join("");
    const source = path.join(root, legacyName, "db");
    fs.mkdirSync(source, { recursive: true });
    fs.writeFileSync(path.join(source, "data.sqlite"), "fixture-db");

    const { DATA_DIR } = await loadDataDir(root);

    expect(DATA_DIR).toBe(path.join(root, "AIMix"));
    expect(fs.readFileSync(path.join(DATA_DIR, "db", "data.sqlite"), "utf8")).toBe("fixture-db");
    expect(fs.existsSync(path.join(DATA_DIR, ".migrated-from-legacy"))).toBe(true);
    expect(fs.readFileSync(path.join(source, "data.sqlite"), "utf8")).toBe("fixture-db");
  });

  it.runIf(process.platform === "win32")("merges missing state without overwriting an existing AIMix root", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "aimix-migration-existing-"));
    temporaryRoots.push(root);
    const legacyName = ["9", "router"].join("");
    fs.mkdirSync(path.join(root, legacyName), { recursive: true });
    fs.writeFileSync(path.join(root, legacyName, "sentinel"), "legacy");
    fs.writeFileSync(path.join(root, legacyName, "legacy-only"), "copied");
    fs.mkdirSync(path.join(root, "AIMix"), { recursive: true });
    fs.writeFileSync(path.join(root, "AIMix", "sentinel"), "current");

    const { DATA_DIR } = await loadDataDir(root);

    expect(fs.readFileSync(path.join(DATA_DIR, "sentinel"), "utf8")).toBe("current");
    expect(fs.readFileSync(path.join(DATA_DIR, "legacy-only"), "utf8")).toBe("copied");
    expect(fs.existsSync(path.join(DATA_DIR, ".migrated-from-legacy"))).toBe(true);
  });
});
