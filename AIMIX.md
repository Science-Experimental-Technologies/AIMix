# AIMix Platform Overview

> One gateway. Every model. Smart execution.

AIMix combines a protocol-compatible AI gateway with a provider-independent decision and execution fabric. This document summarizes platform responsibilities; use the [README](./README.md) for setup and [architecture guide](./docs/ARCHITECTURE.md) for implementation detail.

## Platform layers

1. **Gateway** — compatible model APIs, authentication, streaming, and canonical request handling.
2. **Provider plane** — provider manifests, account state, executors, format translators, and model discovery.
3. **Decision fabric** — classification, hard constraints, candidate scoring, execution planning, and explanations.
4. **Reliability** — health scoring, retry budgets, circuit breakers, fallback graphs, and capacity controls.
5. **Context and knowledge** — context planning, optimization, caching, freshness, scoped memory, retrieval, and citations.
6. **FinOps and governance** — normalized cost, budgets, forecasts, RBAC, audit events, signing, and data classification.
7. **Operations and evaluation** — traces, anomaly detection, incidents, alerts, simulation, experiments, regression checks, and governed learning.
8. **Extensibility** — providers, compatible endpoints, plugins, tool manifests, MCP integrations, SDKs, and skills.

## Compatibility promise

Direct `provider/model` routes are intended to remain deterministic. Adaptive behavior is enabled through explicit policies, aliases, or combos. Security, privacy, capability, health, quota, and hard-budget requirements are constraints; lower cost cannot override them.

## Management API groups

| Surface | Responsibility |
| --- | --- |
| `/v1/*` | Model-facing compatibility API |
| `/api/aimix/decision` | Classification, policy filtering, scoring, and traces |
| `/api/aimix/assets` | Versioned policies and AI assets |
| `/api/aimix/traces` | Explainable execution history |
| `/api/aimix/memory` | Scoped and expiring memory |
| `/api/aimix/workflows/*` | Checkpointed workflow execution |
| `/api/aimix/simulate` | What-if analysis |
| `/api/aimix/doctor` | Runtime diagnostics |
| `/api/aimix/ecosystem` | Lifecycle-aware integration catalog |

## Development guarantees

- Routine tests do not require provider credentials or real model traffic.
- Runtime-supported integrations are distinguished from planned catalog entries.
- High-risk learning and routing changes remain approval-gated.
- Third-party provenance and licensing are preserved.
