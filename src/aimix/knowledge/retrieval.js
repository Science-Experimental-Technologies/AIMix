function tokenize(text) { return new Set(String(text || "").toLowerCase().match(/[a-z0-9_]{2,}/g) || []); }
function score(query, document) { const q = tokenize(query); const d = tokenize(document.text); let overlap = 0; for (const token of q) if (d.has(token)) overlap += 1; return q.size ? overlap / q.size : 0; }

export function retrieveKnowledge(query, documents = [], options = {}) {
  const now = options.now || Date.now(); const seen = new Set();
  const results = documents.filter((document) => !options.filter || Object.entries(options.filter).every(([key, value]) => document.metadata?.[key] === value))
    .filter((document) => !options.maxAgeMs || !document.updatedAt || now - new Date(document.updatedAt).getTime() <= options.maxAgeMs)
    .map((document) => ({ ...document, score: score(query, document) + (Number(document.metadata?.priority) || 0) * 0.01 }))
    .filter((document) => document.score >= (options.minScore || 0))
    .sort((a, b) => b.score - a.score)
    .filter((document) => { const hash = document.text.trim().toLowerCase(); if (seen.has(hash)) return false; seen.add(hash); return true; })
    .slice(0, options.limit || 10);
  return results.map((document, index) => ({ ...document, citation: { index: index + 1, source: document.source || document.id, updatedAt: document.updatedAt || null } }));
}

