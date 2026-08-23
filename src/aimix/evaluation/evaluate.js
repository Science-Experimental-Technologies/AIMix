export function evaluateOutput(output, criteria = {}) {
  const checks = [];
  if (criteria.requiredFields) {
    for (const field of criteria.requiredFields) {
      checks.push({ name: `field:${field}`, pass: output != null && Object.hasOwn(output, field) });
    }
  }
  if (criteria.pattern) checks.push({ name: "pattern", pass: new RegExp(criteria.pattern, criteria.flags).test(String(output)) });
  if (criteria.minLength != null) checks.push({ name: "minLength", pass: String(output ?? "").length >= criteria.minLength });
  if (criteria.custom) {
    const custom = criteria.custom(output);
    checks.push({ name: "custom", pass: Boolean(custom), detail: typeof custom === "string" ? custom : undefined });
  }
  const passed = checks.filter((check) => check.pass).length;
  return { pass: checks.every((check) => check.pass), score: checks.length ? passed / checks.length : 1, checks };
}

