import { TABLES, buildCreateTableSql } from "../schema.js";

const NAMES = ["aimixAssets", "aimixTraces", "aimixMemory", "aimixWorkflowRuns", "aimixAudit"];

export default {
  version: 2,
  name: "aimix-fabric",
  up(db) {
    for (const name of NAMES) {
      const definition = TABLES[name];
      db.exec(buildCreateTableSql(name, definition));
      for (const index of definition.indexes || []) db.exec(index);
    }
  },
};
