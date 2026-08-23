# Deploying AIMix with Docker

This guide describes building and running AIMix from this repository. Substitute your own image reference where `<image>` appears; the project does not advertise an unverified public registry location.

## Build

```bash
docker build -t aimix:local .
```

## Run

```bash
docker run --detach \
  --name aimix \
  --publish 20128:20128 \
  --volume "$HOME/.aimix:/app/data" \
  --env DATA_DIR=/app/data \
  --env PORT=20128 \
  aimix:local
```

Open `http://localhost:20128`. Data remains under `$HOME/.aimix` after the container is replaced.

## Docker Compose

The repository includes `docker-compose.yml` as a starting point:

```bash
docker compose up --detach --build
docker compose logs --follow aimix
```

Inspect the compose file before production use and set authentication, secrets, ports, and volumes for your environment.

## Configuration

| Variable | Purpose | Typical container value |
| --- | --- | --- |
| `DATA_DIR` | Persistent application state | `/app/data` |
| `PORT` | HTTP listening port | `20128` |
| `HOSTNAME` | Listening interface | `0.0.0.0` |
| `NEXT_PUBLIC_BASE_URL` | Externally visible origin | `https://aimix.example.com` |

Use an environment file or secret manager for sensitive values. Do not bake provider keys into an image or commit them to compose files.

## Production checklist

- Put AIMix behind a maintained TLS reverse proxy.
- Enable dashboard authentication before exposing the service.
- Restrict management endpoints to trusted networks.
- Back up the mounted data directory and test restoration.
- Set CPU and memory limits appropriate to concurrency.
- Pin an immutable image tag or digest.
- Monitor container health, request failures, disk use, and database backups.
- Review [SECURITY.md](./SECURITY.md).

## Updating

```bash
docker compose pull
docker compose up --detach
```

Back up the data directory before version upgrades. Review [CHANGELOG.md](./CHANGELOG.md) for migrations or compatibility notes.

## Troubleshooting

```bash
docker logs aimix
docker inspect aimix
docker exec aimix node --version
```

If the database cannot open, verify that `/app/data` exists and is writable by the container user. If clients cannot connect, check port publication, reverse-proxy timeouts, and the configured public base URL.
