import { createHash } from "node:crypto";

const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export class ConfigurationTimeline {
  constructor() { this.versions = []; }
  commit(config, metadata = {}) { const version = { id: hash({ config, parent: this.versions.at(-1)?.id, at: metadata.at || Date.now() }), number: this.versions.length + 1, parentId: this.versions.at(-1)?.id || null, config: structuredClone(config), status: metadata.status || "draft", author: metadata.author || null, message: metadata.message || "", createdAt: metadata.at || new Date().toISOString() }; this.versions.push(version); return version; }
  get(idOrNumber) { return this.versions.find((version) => version.id === idOrNumber || version.number === idOrNumber) || null; }
  diff(from, to) { const a = this.get(from)?.config || {}; const b = this.get(to)?.config || {}; const keys = new Set([...Object.keys(a), ...Object.keys(b)]); return [...keys].filter((key) => JSON.stringify(a[key]) !== JSON.stringify(b[key])).map((key) => ({ key, before: a[key], after: b[key] })); }
  rollback(idOrNumber, metadata = {}) { const target = this.get(idOrNumber); if (!target) throw new Error("Configuration version not found"); return this.commit(target.config, { ...metadata, message: metadata.message || `Rollback to ${target.number}` }); }
}

