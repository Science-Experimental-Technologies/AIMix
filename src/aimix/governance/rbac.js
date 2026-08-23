const DEFAULT_ROLES = Object.freeze({
  administrator: ["*:*"], developer: ["provider:read", "model:read", "policy:read", "workflow:*", "trace:read"],
  operator: ["provider:read", "provider:test", "workflow:execute", "trace:read", "incident:*"], auditor: ["audit:read", "trace:read", "policy:read"], viewer: ["provider:read", "model:read", "trace:read"],
});

export function authorizeRole({ roles = [], permission, customRoles = {} }) {
  for (const role of roles) {
    const permissions = customRoles[role] || DEFAULT_ROLES[role] || [];
    if (permissions.includes("*:*") || permissions.includes(permission) || permissions.includes(`${permission.split(":")[0]}:*`)) return { allowed: true, role };
  }
  return { allowed: false, reason: "rbac_denied" };
}

