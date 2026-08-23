# Support

This document explains how to obtain useful technical help while protecting credentials and private model data.

## Before requesting help

1. Read the [README](./README.md), [documentation index](./docs/README.md), and relevant deployment guide.
2. Review [CHANGELOG.md](./CHANGELOG.md) for recent migrations or breaking behavior.
3. Search existing reports for the same provider, error code, route, or client.
4. Reproduce with the smallest safe request and one explicit model route.
5. Run the applicable checks and retain sanitized output.

```bash
npm run check:structure
npm run check:docs
npm run test:aimix
```

## Information to include

- AIMix version or commit
- operating system, architecture, and Node.js version
- source, Docker, or CLI installation method
- client name and protocol surface
- provider and sanitized model route
- streaming or non-streaming mode
- exact expected and actual behavior
- minimal reproduction steps
- sanitized logs and HTTP status codes
- whether the issue began after an upgrade

## Information never to include

Remove API keys, OAuth tokens, cookies, signing secrets, prompts, model output, account identifiers, billing details, private hostnames, and database contents. Replace sensitive values consistently so request flow remains understandable.

## Where to report

- Reproducible defects belong in the bug-report template.
- Feature and provider proposals belong in the feature-request template.
- Questions without a product defect should use the official discussion channel when one is configured.
- Vulnerabilities must follow [SECURITY.md](./SECURITY.md) and must not be posted publicly.

## Support boundaries

Community support is best-effort. Provider availability, model behavior, pricing, quotas, authentication approval, and upstream account enforcement are controlled by their respective operators. AIMix cannot guarantee access to or continued operation of a third-party service.
