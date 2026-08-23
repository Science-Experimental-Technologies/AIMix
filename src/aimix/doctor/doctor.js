export async function runDoctor({ providers = [], checks = {} } = {}) {
  const results = [];
  const run = async (name, check, required = true) => {
    try { const detail = await check(); results.push({ name, status: detail === false ? "fail" : "pass", detail }); }
    catch (error) { results.push({ name, status: required ? "fail" : "warn", detail: error.message }); }
  };
  await run("database", checks.database || (async () => true));
  await run("cache", checks.cache || (async () => true), false);
  await run("routing-policy", checks.policy || (async () => true));
  await run("security-policy", checks.security || (async () => true));
  for (const provider of providers) await run(`provider:${provider.id}`, () => checks.provider ? checks.provider(provider) : true, false);
  const failures = results.filter((result) => result.status === "fail");
  return { healthy: failures.length === 0, results, remediation: failures.map((failure) => ({ check: failure.name, action: `Resolve ${failure.name}: ${failure.detail || "check configuration"}` })) };
}

