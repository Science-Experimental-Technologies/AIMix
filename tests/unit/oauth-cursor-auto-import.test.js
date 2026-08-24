import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as fsPromises from "fs/promises";

const execFileMock = vi.hoisted(() => vi.fn());

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ status: init?.status || 200, body, json: async () => body })),
  },
}));

vi.mock("os", () => ({
  default: { homedir: vi.fn(() => "/mock/home") },
  homedir: vi.fn(() => "/mock/home"),
}));

vi.mock("fs/promises", () => ({ access: vi.fn(), constants: { R_OK: 4 } }));
vi.mock("child_process", () => ({ execFile: execFileMock }));

const mockDbInstance = {
  prepare: vi.fn(),
  close: vi.fn(),
  throwOnConstruct: false,
};

vi.mock("better-sqlite3", () => ({
  default: class MockDatabase {
    constructor() {
      if (mockDbInstance.throwOnConstruct) throw new Error("SQLITE_CANTOPEN");
      return mockDbInstance;
    }
  },
}));

describe("GET /api/oauth/cursor/auto-import", () => {
  const originalPlatform = process.platform;
  let GET;
  let rows;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    rows = new Map();
    mockDbInstance.throwOnConstruct = false;
    mockDbInstance.prepare.mockReturnValue({
      get: vi.fn((key) => rows.has(key) ? { value: rows.get(key) } : undefined),
    });
    execFileMock.mockImplementation((...args) => {
      const callback = args.at(-1);
      callback(new Error("executable not available"), "", "");
    });
    Object.defineProperty(process, "platform", { value: "darwin", writable: true });
    ({ GET } = await import("../../src/app/api/oauth/cursor/auto-import/route.js"));
  });

  afterEach(() => {
    Object.defineProperty(process, "platform", { value: originalPlatform, writable: true });
  });

  it("lists checked macOS locations when no candidate database is readable", async () => {
    vi.mocked(fsPromises.access).mockRejectedValue(new Error("ENOENT"));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.body.found).toBe(false);
    expect(response.body.error).toContain("Cursor database not found. Checked locations:");
    expect(response.body.error).toContain("Cursor - Insiders");
    expect(fsPromises.access).toHaveBeenCalledTimes(2);
  });

  it("falls back to manual import when the native database cannot be opened", async () => {
    vi.mocked(fsPromises.access).mockResolvedValue();
    mockDbInstance.throwOnConstruct = true;
    const response = await GET();
    expect(response.body).toMatchObject({ found: false, windowsManual: true });
    expect(response.body.dbPath).toContain("state.vscdb");
    expect(execFileMock).toHaveBeenCalled();
  });

  it("extracts access token and machine id through the exact primary keys", async () => {
    vi.mocked(fsPromises.access).mockResolvedValue();
    rows.set("cursorAuth/accessToken", "test-token");
    rows.set("storage.serviceMachineId", "test-machine-id");
    const response = await GET();
    expect(response.body).toEqual({ found: true, accessToken: "test-token", machineId: "test-machine-id" });
    expect(mockDbInstance.close).toHaveBeenCalledTimes(1);
    expect(execFileMock).not.toHaveBeenCalled();
  });

  it("unwraps JSON-encoded string values", async () => {
    vi.mocked(fsPromises.access).mockResolvedValue();
    rows.set("cursorAuth/accessToken", '"json-token"');
    rows.set("storage.serviceMachineId", '"json-machine-id"');
    const response = await GET();
    expect(response.body.accessToken).toBe("json-token");
    expect(response.body.machineId).toBe("json-machine-id");
  });

  it("tries secondary exact keys when primary keys are absent", async () => {
    vi.mocked(fsPromises.access).mockResolvedValue();
    rows.set("cursorAuth/token", "fallback-token");
    rows.set("storage.machineId", "fallback-machine");
    const response = await GET();
    expect(response.body).toMatchObject({ found: true, accessToken: "fallback-token", machineId: "fallback-machine" });
  });

  it("returns manual-import metadata when exact keys and CLI fallback are unavailable", async () => {
    vi.mocked(fsPromises.access).mockResolvedValue();
    const response = await GET();
    expect(response.body).toMatchObject({ found: false, windowsManual: true });
    expect(mockDbInstance.close).toHaveBeenCalledTimes(1);
    expect(execFileMock).toHaveBeenCalled();
  });

  it("lists both Linux candidate paths when neither is readable", async () => {
    Object.defineProperty(process, "platform", { value: "linux", writable: true });
    vi.mocked(fsPromises.access).mockRejectedValue(new Error("ENOENT"));
    const response = await GET();
    expect(response.body.found).toBe(false);
    expect(response.body.error).toContain(".config");
    expect(response.body.error).toContain("cursor");
    expect(fsPromises.access).toHaveBeenCalledTimes(2);
  });

  it("uses generic config candidates on other desktop platforms", async () => {
    Object.defineProperty(process, "platform", { value: "freebsd", writable: true });
    vi.mocked(fsPromises.access).mockRejectedValue(new Error("ENOENT"));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.body.found).toBe(false);
    expect(response.body.error).toContain("Checked locations");
  });
});
