# AIMix Documentation

This directory contains technical documentation for contributors, operators, and integrators. Product and translated user guides live under `gitbook/content`; repository policies remain at the project root.

## Start here

| Audience | Recommended document |
| --- | --- |
| New users | [Project README](../README.md) |
| Operators | [Docker deployment](../DOCKER.md) and [Security policy](../SECURITY.md) |
| Contributors | [Contributing guide](../CONTRIBUTING.md) |
| Runtime engineers | [Architecture](./ARCHITECTURE.md) |
| Platform integrators | [AIMix overview](../AIMIX.md) |
| Support and incident responders | [Support guide](../SUPPORT.md) |

## Documentation map

- `ARCHITECTURE.md` defines current system boundaries and request lifecycle.
- `superpowers/specs` contains point-in-time design specifications.
- `superpowers/plans` contains implementation plans and should not be treated as current product guarantees.
- `../gitbook/content` contains localized product and integration guides.
- `../i18n` contains translated repository landing pages.
- `../skills` documents agent-facing AIMix capabilities.
- `../tests/README.md` documents test organization and real-provider safety.

## Source-of-truth policy

When documents conflict, prefer runtime code and tests, followed by current architecture and root documentation. Plans, historical changelog entries, and translated guides may lag behind active development. Runtime support must be confirmed through provider manifests and lifecycle status, not inferred from a roadmap or catalog mention.

## Writing standards

- Describe verified behavior and clearly label planned work.
- Use provider-neutral language unless a section is provider-specific.
- Do not promise availability, free quotas, pricing, or unlimited usage controlled by third parties.
- Never include real credentials, prompts, account identifiers, or private endpoints.
- Keep commands runnable and identify whether they target development or production.
- Preserve third-party attribution and component-specific license terms.
- Link to repository-relative sources instead of inventing an official domain.

Run the documentation checks before submitting changes:

```bash
npm run check:docs
git diff --check
```
