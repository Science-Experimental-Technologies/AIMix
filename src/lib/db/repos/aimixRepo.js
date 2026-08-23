import { randomUUID } from "node:crypto";
import { getAdapter } from "../driver.js";
import { parseJson, stringifyJson } from "../helpers/jsonCol.js";

const now = () => new Date().toISOString();

export async function createAimixAsset(asset) {
  const db = await getAdapter();
  const timestamp = now();
  const row = { id: asset.id || randomUUID(), type: asset.type, name: asset.name, version: asset.version || 1, status: asset.status || "draft", owner: asset.owner || null, environment: asset.environment || "development", data: asset.data || {}, createdAt: timestamp, updatedAt: timestamp };
  db.run(`INSERT INTO aimixAssets(id,type,name,version,status,owner,environment,data,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?)`, [row.id, row.type, row.name, row.version, row.status, row.owner, row.environment, stringifyJson(row.data), row.createdAt, row.updatedAt]);
  return row;
}

export async function listAimixAssets(filter = {}) {
  const db = await getAdapter(); const conditions = []; const params = [];
  for (const key of ["type", "name", "status", "environment"]) if (filter[key]) { conditions.push(`${key} = ?`); params.push(filter[key]); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return db.all(`SELECT * FROM aimixAssets ${where} ORDER BY updatedAt DESC`, params).map((row) => ({ ...row, data: parseJson(row.data, {}) }));
}

export async function saveAimixTrace(trace) {
  const db = await getAdapter();
  const row = { id: trace.id || randomUUID(), requestId: trace.requestId, projectId: trace.projectId || null, environment: trace.environment || "development", status: trace.status || "completed", startedAt: trace.startedAt || now(), endedAt: trace.endedAt || now(), data: trace };
  db.run(`INSERT OR REPLACE INTO aimixTraces(id,requestId,projectId,environment,status,startedAt,endedAt,data) VALUES(?,?,?,?,?,?,?,?)`, [row.id, row.requestId, row.projectId, row.environment, row.status, row.startedAt, row.endedAt, stringifyJson(row.data)]);
  return row;
}

export async function listAimixTraces({ limit = 100, projectId, environment } = {}) {
  const db = await getAdapter(); const conditions = []; const params = [];
  if (projectId) { conditions.push("projectId = ?"); params.push(projectId); }
  if (environment) { conditions.push("environment = ?"); params.push(environment); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(Math.min(1000, Math.max(1, Number(limit) || 100)));
  return db.all(`SELECT data FROM aimixTraces ${where} ORDER BY startedAt DESC LIMIT ?`, params).map((row) => parseJson(row.data, {}));
}

export async function putAimixMemory(entry) {
  const db = await getAdapter(); const timestamp = now(); const id = entry.id || randomUUID();
  db.run(`INSERT INTO aimixMemory(id,scope,scopeId,key,confidence,expiresAt,data,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(scope,scopeId,key) DO UPDATE SET confidence=excluded.confidence,expiresAt=excluded.expiresAt,data=excluded.data,updatedAt=excluded.updatedAt`, [id, entry.scope, entry.scopeId, entry.key, entry.confidence ?? 1, entry.expiresAt || null, stringifyJson(entry.data), timestamp, timestamp]);
  return { ...entry, id, createdAt: timestamp, updatedAt: timestamp };
}

export async function getAimixMemory(scope, scopeId) {
  const db = await getAdapter(); const timestamp = now();
  return db.all(`SELECT * FROM aimixMemory WHERE scope=? AND scopeId=? AND (expiresAt IS NULL OR expiresAt > ?) ORDER BY confidence DESC, updatedAt DESC`, [scope, scopeId, timestamp]).map((row) => ({ ...row, data: parseJson(row.data, null) }));
}

export async function saveWorkflowRun(run) {
  const db = await getAdapter(); const timestamp = now(); const id = run.id || randomUUID();
  db.run(`INSERT INTO aimixWorkflowRuns(id,workflowId,status,idempotencyKey,checkpoint,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,checkpoint=excluded.checkpoint,updatedAt=excluded.updatedAt`, [id, run.workflowId, run.status, run.idempotencyKey || null, stringifyJson(run.checkpoint || {}), run.createdAt || timestamp, timestamp]);
  return { ...run, id, updatedAt: timestamp };
}

export async function appendAimixAudit(event) {
  const db = await getAdapter(); const timestamp = event.timestamp || now();
  const result = db.run(`INSERT INTO aimixAudit(timestamp,actorType,actorId,action,resourceType,resourceId,outcome,data) VALUES(?,?,?,?,?,?,?,?)`, [timestamp, event.actorType, event.actorId || null, event.action, event.resourceType, event.resourceId || null, event.outcome, stringifyJson(event.data || {})]);
  return { ...event, id: result.lastInsertRowid, timestamp };
}
