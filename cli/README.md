# AIMix CLI

The AIMix CLI launches and manages the local AIMix gateway and dashboard. It is the terminal-facing package for the main [AIMix project](../README.md).

## Requirements

- Node.js 18 or newer
- npm

## Development

From the repository root:

```bash
npm install
npm --prefix cli install
npm --prefix cli run dev
```

Build a local package:

```bash
npm run cli:pack
```

## Commands

```text
aimix                 Start AIMix
aimix --port 8080     Use a custom port
aimix --no-browser    Do not open the dashboard automatically
aimix --skip-update   Skip the update check
aimix --help          Show supported options
```

Exact options may differ by release; `aimix --help` is authoritative.

## Data and runtime dependencies

The CLI stores AIMix state in the platform-specific application data directory. Native or optional runtime packages may be installed outside the global npm package so locked binaries do not prevent CLI upgrades on Windows. Back up the AIMix data directory before upgrades or migrations.

## Security

The CLI can manage provider credentials and local processes. Install it only from a repository or package publisher you trust, keep dashboard authentication enabled for remote access, and never include secrets in bug reports. See the project [security policy](../SECURITY.md).

## License

Distributed under the [MIT License](./LICENSE). Third-party components retain their respective terms; see the project [notices](../THIRD_PARTY_NOTICES.md).
