# Third-Party Notices

This repository includes original AIMix work, modifications, and components derived from or interoperating with third-party software. The project-level MIT License does not replace component-specific licenses.

## 9Router provenance

Portions of the gateway compatibility plane were derived from the 9Router project by decolua and contributors under the MIT License. Its copyright and permission notice remains applicable to derived portions:

```text
MIT License

Copyright (c) 2024-2026 decolua and contributors
```

The complete MIT permission terms are reproduced in the repository [LICENSE](./LICENSE).

## Optional ecosystem integrations

AIMix can discover or invoke software that is not bundled as part of the core distribution. Examples include Headroom and RTK (Apache-2.0), TokenSave (MIT), model runtimes, MCP servers, databases, and provider SDKs. Their names identify interoperability targets and do not imply endorsement, ownership, bundling, or relicensing.

## Runtime dependencies

JavaScript dependency names and resolved versions are recorded in `package.json`, `package-lock.json`, and the CLI package metadata. Each dependency remains subject to its own license. Container base images, operating-system packages, optional native database drivers, and separately installed tools may carry additional terms.

Distributors are responsible for reviewing the exact dependency graph and preserving all notices required for the artifacts they ship.
