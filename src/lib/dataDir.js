import fs from "node:fs";
import path from "path";
import os from "os";

const APP_NAME = "AIMix";
const LEGACY_APP_NAME = ["9", "router"].join("");

export function platformRoot(appName) {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), appName);
  }
  return path.join(os.homedir(), `.${appName.toLowerCase()}`);
}

export function migrateLegacyData(targetDir) {
  const legacyDir = platformRoot(LEGACY_APP_NAME);
  const markerPath = path.join(targetDir, ".migrated-from-legacy");
  if (fs.existsSync(markerPath) || !fs.existsSync(/* turbopackIgnore: true */ legacyDir)) return;

  const parent = path.dirname(targetDir);
  const lockPath = path.join(parent, ".aimix-data-migration.lock");
  const stagingDir = path.join(parent, `.aimix-migration-${process.pid}-${Date.now()}`);
  let lock;

  try {
    fs.mkdirSync(parent, { recursive: true });
    lock = fs.openSync(lockPath, "wx");
  } catch (error) {
    if (error?.code === "EEXIST") return;
    throw error;
  }

  try {
    const metadata = JSON.stringify(
      { source: legacyDir, migratedAt: new Date().toISOString(), strategy: "copy-first" },
      null,
      2,
    );

    if (fs.existsSync(targetDir)) {
      fs.cpSync(legacyDir, targetDir, { recursive: true, force: false, errorOnExist: false });
      fs.writeFileSync(markerPath, metadata);
      console.warn(`[AIMix] Missing state was copied into ${targetDir}; existing files and the source remain intact.`);
    } else {
      fs.cpSync(legacyDir, stagingDir, { recursive: true, errorOnExist: true });
      fs.writeFileSync(path.join(stagingDir, ".migrated-from-legacy"), metadata);
      fs.renameSync(stagingDir, targetDir);
      console.warn(`[AIMix] Existing application data was copied to ${targetDir}; the original remains intact.`);
    }
  } catch (error) {
    if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });
    throw error;
  } finally {
    if (lock !== undefined) fs.closeSync(lock);
    try {
      fs.unlinkSync(lockPath);
    } catch (error) {
      if (error?.code !== "ENOENT") console.warn(`[AIMix] Could not remove migration lock: ${error.message}`);
    }
  }
}

function defaultDir() {
  const targetDir = platformRoot(APP_NAME);
  migrateLegacyData(targetDir);
  return targetDir;
}

export function getDataDir() {
  const configured = process.env.DATA_DIR;
  if (!configured) return defaultDir();

  // On Windows, ignore Unix-style absolute paths (e.g. /var/lib/...) that come
  // from a Linux-targeted .env or Docker config — they are not valid here.
  if (process.platform === "win32" && /^\//.test(configured)) {
    console.warn(`[DATA_DIR] '${configured}' is a Unix path on Windows → fallback to default`);
    return defaultDir();
  }

  try {
    fs.mkdirSync(configured, { recursive: true });
    return configured;
  } catch (e) {
    if (e?.code === "EACCES" || e?.code === "EPERM") {
      console.warn(`[DATA_DIR] '${configured}' not writable → fallback ~/.${APP_NAME}`);
      return defaultDir();
    }
    throw e;
  }
}

export const DATA_DIR = getDataDir();
