# Algo Clicker (Docker Compose)

This repository contains a **Scala WebSocket backend** and a **React/Vite frontend**.
This `docker-compose.yml` sets up a simple local dev environment where:

- **Frontend** is served by Vite (port `5173` inside the container)
- Backend is a Scala WebSocket server (listening on port `80` inside the container; exposed on host port `8081` to avoid conflicts)
- **Caddy** routes requests based on hostname (port `80` on the host)

## Goals

- Frontend should access backend using `ws://algo-backend.froemosen.dk`
- Frontend should be served on `http://algo.froemosen.dk`
- Both services should run via `docker-compose up`

## Run locally (without Cloudflare)

1. Ensure these hostnames resolve to `localhost` (e.g. `/etc/hosts`):

```
127.0.0.1 algo.froemosen.dk
127.0.0.1 algo-backend.froemosen.dk
```

2. Start the services:

```sh
docker compose up --build
```

3. Open the frontend in your browser:

- http://algo.froemosen.dk

The frontend will connect to the backend at `wss://algo-backend.froemosen.dk` (via the Caddy proxy).

> If port `8080` is already in use on your machine, the backend is exposed on port `8081`.

## Running via Cloudflare Tunnels

Configure Cloudflare Tunnel to forward:

- `algo.froemosen.dk` → `localhost:80` (Caddy will proxy to the frontend)
- `algo-backend.froemosen.dk` → `localhost:80` (Caddy will proxy to the backend)

Then run:

```sh
docker-compose up --build
```

---

## Notes

- The frontend uses `VITE_BACKEND_WS_URL` to determine where to connect. The compose setup points it at `ws://algo-backend:80` (internal Docker service name).
- The backend server already includes compiled Scala classes under `backend/out/production/backend`.
