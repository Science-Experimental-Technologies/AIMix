const OBJECTIVES = new Set(["quality-first", "cost-first", "latency-first", "reliability-first", "privacy-first", "balanced"]);
export function parseARL(source = "") {
  const policy = { constraints: [], preferences: [] };
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim(); if (!line || line.startsWith("#")) continue;
    const [command, ...rest] = line.split(/\s+/); const value = rest.join(" ");
    if (command === "objective" && OBJECTIVES.has(value)) policy.objective = value;
    else if (command === "allow-provider") policy.allowedProviders = [...(policy.allowedProviders || []), value];
    else if (command === "deny-provider") policy.deniedProviders = [...(policy.deniedProviders || []), value];
    else if (command === "max-cost") policy.hardRequestCost = Number(value);
    else if (command === "region") policy.allowedRegions = value.split(",").map((item) => item.trim());
    else if (command === "require") policy.constraints.push(value);
    else if (command === "prefer") policy.preferences.push(value);
    else throw new Error(`Unknown or invalid ARL command: ${line}`);
  }
  return policy;
}

