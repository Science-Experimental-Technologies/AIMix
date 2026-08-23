export const OBJECTIVES = Object.freeze({
  BALANCED: "balanced",
  QUALITY: "quality-first",
  COST: "cost-first",
  LATENCY: "latency-first",
  RELIABILITY: "reliability-first",
  PRIVACY: "privacy-first",
});

export const DEFAULT_WEIGHTS = Object.freeze({
  quality: 0.3,
  reliability: 0.2,
  latency: 0.15,
  cost: 0.15,
  quota: 0.1,
  privacy: 0.1,
});

export const PRIVACY_LEVELS = Object.freeze({
  PUBLIC: 0,
  INTERNAL: 1,
  PRIVATE: 2,
  SENSITIVE: 3,
});

