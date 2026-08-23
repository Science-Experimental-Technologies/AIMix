const RULES = Object.freeze([
  { type: "secret", level: "sensitive", pattern: /\b(?:sk|pk|api)[-_][a-z0-9_-]{16,}\b/gi },
  { type: "private-key", level: "sensitive", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { type: "email", level: "private", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { type: "phone", level: "private", pattern: /(?:\+?\d[\s.-]?){10,15}/g },
  { type: "credit-card", level: "sensitive", pattern: /\b(?:\d[ -]*?){13,19}\b/g },
]);
const ORDER = { public: 0, internal: 1, private: 2, sensitive: 3 };

export function detectDataSensitivity(text = "") {
  const findings = [];
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    for (const match of String(text).matchAll(rule.pattern)) findings.push({ type: rule.type, level: rule.level, index: match.index, length: match[0].length });
  }
  const level = findings.reduce((current, finding) => ORDER[finding.level] > ORDER[current] ? finding.level : current, "internal");
  return { level, findings };
}

export function redactSensitiveData(text = "") {
  let output = String(text);
  for (const rule of RULES) { rule.pattern.lastIndex = 0; output = output.replace(rule.pattern, `[REDACTED:${rule.type}]`); }
  return output;
}

