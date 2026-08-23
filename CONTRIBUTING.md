# Contributing to AIMix

Thank you for improving AIMix. Contributions should preserve the gateway's provider-neutral behavior, security boundaries, and compatibility contracts.

## Before opening a change

1. Search existing issues and changes to avoid duplicate work.
2. Keep a change focused; separate unrelated refactors from behavior changes.
3. Never add secrets, captured prompts, access tokens, or proprietary model output.
4. Confirm that new dependencies and copied assets have compatible licenses.

## Local setup

```bash
npm install
npm --prefix tests install
npm run dev
```

Run checks before submitting:

```bash
npm run check:structure
npm run test:aimix
npx eslint <changed-files>
git diff --check
```

Tests that contact real providers must remain explicitly opt-in. Unit and CI checks must not depend on provider credentials.

## Repository conventions

- Put provider-independent intelligence in `src/aimix`.
- Put provider definitions in `open-sse/providers/registry` and regenerate the index with `npm run generate:providers`.
- Use `open-sse/executors` only when an upstream cannot use the generic transport.
- Keep protocol conversion in translators; do not duplicate it in route handlers.
- Put reusable application services in `src/lib`, not inside UI components.
- Keep API routes thin: validate, authorize, call a domain module, and serialize.
- Use lifecycle statuses honestly. A catalog entry is not `supported` until its runtime path exists and is tested.

## Adding a provider

1. Start from `open-sse/providers/REGISTRY_TEMPLATE.js`.
2. Declare transports, authentication, capabilities, validation behavior, and conservative seed models.
3. Avoid hardcoding a large model list when the provider exposes discovery.
4. Add focused tests without sending model traffic.
5. Run `npm run generate:providers` and `npm run check:structure`.

## Change quality

A good contribution explains the problem, design, risk, compatibility impact, and verification. Include screenshots only for visible UI changes. Mention migrations and rollback steps when state changes.

By contributing, you agree that your contribution may be distributed under the repository's MIT License and that you have the right to submit it.
