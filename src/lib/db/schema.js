// ⚠️ AGENT/DEV: Bump this by +1 EVERY TIME you change the schema below
// (add/remove/alter a table, column, or index in TABLES). It drives the
// pre-change safety backup in migrate.js: when the stored version is lower,
// one lightweight DB backup is taken before applying schema changes. Forgetting
// to bump only skips that backup — it does NOT break the additive auto-sync.
export const SCHEMA_VERSION = 2;

export const PRAGMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 30000000;
PRAGMA cache_size = -64000;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;
`;

// Declarative current schema. Used by syncSchemaFromTables() to
// auto-add missing tables/columns/indexes after versioned migrations.
// For destructive changes (drop/rename/type-change), write a migration file.
export const TABLES = {
  _meta: {
    columns: {
      key: "TEXT PRIMARY KEY",
      value: "TEXT NOT NULL",
    },
  },
  settings: {
    columns: {
      id: "INTEGER PRIMARY KEY CHECK (id = 1)",
      data: "TEXT NOT NULL",
    },
  },
  providerConnections: {
    columns: {
      id: "TEXT PRIMARY KEY",
      provider: "TEXT NOT NULL",
      authType: "TEXT NOT NULL",
      name: "TEXT",
      email: "TEXT",
      priority: "INTEGER",
      isActive: "INTEGER DEFAULT 1",
      data: "TEXT NOT NULL",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_pc_provider ON providerConnections(provider)",
      "CREATE INDEX IF NOT EXISTS idx_pc_provider_active ON providerConnections(provider, isActive)",
      "CREATE INDEX IF NOT EXISTS idx_pc_priority ON providerConnections(provider, priority)",
    ],
  },
  providerNodes: {
    columns: {
      id: "TEXT PRIMARY KEY",
      type: "TEXT",
      name: "TEXT",
      data: "TEXT NOT NULL",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: ["CREATE INDEX IF NOT EXISTS idx_pn_type ON providerNodes(type)"],
  },
  proxyPools: {
    columns: {
      id: "TEXT PRIMARY KEY",
      isActive: "INTEGER DEFAULT 1",
      testStatus: "TEXT",
      data: "TEXT NOT NULL",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_pp_active ON proxyPools(isActive)",
      "CREATE INDEX IF NOT EXISTS idx_pp_status ON proxyPools(testStatus)",
    ],
  },
  apiKeys: {
    columns: {
      id: "TEXT PRIMARY KEY",
      key: "TEXT UNIQUE NOT NULL",
      name: "TEXT",
      machineId: "TEXT",
      isActive: "INTEGER DEFAULT 1",
      createdAt: "TEXT NOT NULL",
    },
    indexes: ["CREATE INDEX IF NOT EXISTS idx_ak_key ON apiKeys(key)"],
  },
  combos: {
    columns: {
      id: "TEXT PRIMARY KEY",
      name: "TEXT UNIQUE NOT NULL",
      kind: "TEXT",
      models: "TEXT NOT NULL",
      createdAt: "TEXT NOT NULL",
      updatedAt: "TEXT NOT NULL",
    },
    indexes: ["CREATE INDEX IF NOT EXISTS idx_combo_name ON combos(name)"],
  },
  kv: {
    columns: {
      scope: "TEXT NOT NULL",
      key: "TEXT NOT NULL",
      value: "TEXT NOT NULL",
    },
    primaryKey: "PRIMARY KEY (scope, key)",
    indexes: ["CREATE INDEX IF NOT EXISTS idx_kv_scope ON kv(scope)"],
  },
  usageHistory: {
    columns: {
      id: "INTEGER PRIMARY KEY AUTOINCREMENT",
      timestamp: "TEXT NOT NULL",
      provider: "TEXT",
      model: "TEXT",
      connectionId: "TEXT",
      apiKey: "TEXT",
      endpoint: "TEXT",
      promptTokens: "INTEGER DEFAULT 0",
      completionTokens: "INTEGER DEFAULT 0",
      cost: "REAL DEFAULT 0",
      status: "TEXT",
      tokens: "TEXT",
      meta: "TEXT",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_uh_ts ON usageHistory(timestamp DESC)",
      "CREATE INDEX IF NOT EXISTS idx_uh_provider ON usageHistory(provider)",
      "CREATE INDEX IF NOT EXISTS idx_uh_model ON usageHistory(model)",
      "CREATE INDEX IF NOT EXISTS idx_uh_conn ON usageHistory(connectionId)",
    ],
  },
  usageDaily: {
    columns: {
      dateKey: "TEXT PRIMARY KEY",
      data: "TEXT NOT NULL",
    },
  },
  requestDetails: {
    columns: {
      id: "TEXT PRIMARY KEY",
      timestamp: "TEXT NOT NULL",
      provider: "TEXT",
      model: "TEXT",
      connectionId: "TEXT",
      status: "TEXT",
      data: "TEXT NOT NULL",
    },
    indexes: [
      "CREATE INDEX IF NOT EXISTS idx_rd_ts ON requestDetails(timestamp DESC)",
      "CREATE INDEX IF NOT EXISTS idx_rd_provider ON requestDetails(provider)",
      "CREATE INDEX IF NOT EXISTS idx_rd_model ON requestDetails(model)",
      "CREATE INDEX IF NOT EXISTS idx_rd_conn ON requestDetails(connectionId)",
    ],
  },
  aimixAssets: {
    columns: { id: "TEXT PRIMARY KEY", type: "TEXT NOT NULL", name: "TEXT NOT NULL", version: "INTEGER NOT NULL DEFAULT 1", status: "TEXT NOT NULL DEFAULT 'draft'", owner: "TEXT", environment: "TEXT NOT NULL DEFAULT 'development'", data: "TEXT NOT NULL", createdAt: "TEXT NOT NULL", updatedAt: "TEXT NOT NULL" },
    indexes: ["CREATE UNIQUE INDEX IF NOT EXISTS idx_aa_identity ON aimixAssets(type, name, version, environment)", "CREATE INDEX IF NOT EXISTS idx_aa_type_status ON aimixAssets(type, status)"],
  },
  aimixTraces: {
    columns: { id: "TEXT PRIMARY KEY", requestId: "TEXT NOT NULL", projectId: "TEXT", environment: "TEXT", status: "TEXT NOT NULL", startedAt: "TEXT NOT NULL", endedAt: "TEXT", data: "TEXT NOT NULL" },
    indexes: ["CREATE INDEX IF NOT EXISTS idx_at_request ON aimixTraces(requestId)", "CREATE INDEX IF NOT EXISTS idx_at_started ON aimixTraces(startedAt DESC)", "CREATE INDEX IF NOT EXISTS idx_at_project ON aimixTraces(projectId, environment)"],
  },
  aimixMemory: {
    columns: { id: "TEXT PRIMARY KEY", scope: "TEXT NOT NULL", scopeId: "TEXT NOT NULL", key: "TEXT NOT NULL", confidence: "REAL NOT NULL DEFAULT 1", expiresAt: "TEXT", data: "TEXT NOT NULL", createdAt: "TEXT NOT NULL", updatedAt: "TEXT NOT NULL" },
    indexes: ["CREATE UNIQUE INDEX IF NOT EXISTS idx_am_identity ON aimixMemory(scope, scopeId, key)", "CREATE INDEX IF NOT EXISTS idx_am_expiry ON aimixMemory(expiresAt)"],
  },
  aimixWorkflowRuns: {
    columns: { id: "TEXT PRIMARY KEY", workflowId: "TEXT NOT NULL", status: "TEXT NOT NULL", idempotencyKey: "TEXT", checkpoint: "TEXT NOT NULL", createdAt: "TEXT NOT NULL", updatedAt: "TEXT NOT NULL" },
    indexes: ["CREATE UNIQUE INDEX IF NOT EXISTS idx_awr_idempotency ON aimixWorkflowRuns(idempotencyKey) WHERE idempotencyKey IS NOT NULL", "CREATE INDEX IF NOT EXISTS idx_awr_workflow ON aimixWorkflowRuns(workflowId, status)"],
  },
  aimixAudit: {
    columns: { id: "INTEGER PRIMARY KEY AUTOINCREMENT", timestamp: "TEXT NOT NULL", actorType: "TEXT NOT NULL", actorId: "TEXT", action: "TEXT NOT NULL", resourceType: "TEXT NOT NULL", resourceId: "TEXT", outcome: "TEXT NOT NULL", data: "TEXT NOT NULL" },
    indexes: ["CREATE INDEX IF NOT EXISTS idx_audit_ts ON aimixAudit(timestamp DESC)", "CREATE INDEX IF NOT EXISTS idx_audit_resource ON aimixAudit(resourceType, resourceId)", "CREATE INDEX IF NOT EXISTS idx_audit_actor ON aimixAudit(actorType, actorId)"],
  },
};

export function buildCreateTableSql(name, def) {
  const cols = Object.entries(def.columns).map(([k, v]) => `${k} ${v}`);
  if (def.primaryKey) cols.push(def.primaryKey);
  return `CREATE TABLE IF NOT EXISTS ${name} (${cols.join(", ")})`;
}
