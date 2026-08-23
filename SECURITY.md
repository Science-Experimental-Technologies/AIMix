# Security Policy

## Reporting a vulnerability

Do not disclose exploitable vulnerabilities in a public issue. Use the repository host's private security-advisory feature or the private channel published by the official repository owner. Include affected versions, impact, reproduction steps, and any proposed mitigation.

If no private channel is configured, open a public issue containing only a request for a security contact—do not include exploit details.

## Supported versions

Security fixes target the latest released version and the current default branch. Older builds may not receive backports until a long-term-support policy is published.

## Deployment guidance

- Bind to localhost unless remote access is required.
- Enable dashboard authentication and use strong, unique credentials.
- Place public deployments behind TLS and a maintained reverse proxy.
- Restrict management routes at the network boundary.
- Keep provider secrets outside source control and rotate exposed credentials immediately.
- Mount the data directory with least-privilege filesystem permissions.
- Keep request-content logging disabled unless explicitly required and protected.
- Review optional plugins, MCP servers, CLI tools, and custom endpoints before enabling them.
- Treat local model endpoints and discovery targets as trusted administrative configuration.

## Scope

Security reports may cover authentication bypass, credential exposure, request forgery, unsafe proxying, cross-tenant data access, arbitrary code execution, malicious plugin escalation, and sensitive-data leakage. Provider outages, account limits, model quality, and prompt-injection behavior without a boundary bypass are generally operational concerns.

No bug-bounty payment is promised unless the official repository separately publishes a bounty program.
