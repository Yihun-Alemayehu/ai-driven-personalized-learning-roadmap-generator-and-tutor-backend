# Learner Roadmap Backend — Full Deployment Guide (DigitalOcean VPS)

Deploy the backend to a DigitalOcean droplet using **Docker**, a shared **nginx-proxy** with automatic **Let’s Encrypt** SSL, **GitHub Actions** to build images, and **GHCR** as the container registry.

---

## Table of contents

1. [How it works](#1-how-it-works)
2. [What you need](#2-what-you-need)
3. [VPS setup — Docker](#3-vps-setup--docker)
4. [VPS setup — shared reverse proxy (SSL)](#4-vps-setup--shared-reverse-proxy-ssl)
5. [DNS](#5-dns)
6. [GitHub Actions secrets](#6-github-actions-secrets)
7. [GitHub Container Registry (GHCR)](#7-github-container-registry-ghcr)
8. [Production `.env` on the VPS](#8-production-env-on-the-vps)
9. [First deploy](#9-first-deploy)
10. [Verify the deployment](#10-verify-the-deployment)
11. [Every deploy after the first](#11-every-deploy-after-the-first)
12. [Useful VPS commands](#12-useful-vps-commands)
13. [Troubleshooting](#13-troubleshooting)
14. [Fix broken or stale SSL certificates](#14-fix-broken-or-stale-ssl-certificates)
15. [Local production-like test](#15-local-production-like-test)

---

## 1. How it works

```
Internet → nginx-proxy (ports 80/443, Let's Encrypt)
              ↓  webgateway network
         learner-roadmap-nginx  →  routes /api/v1/* to services
              ↓  internal network
         api-gateway | learning-service | ai-service
              ↓
         postgres | redis
```

| Step | Where | What happens |
|------|--------|----------------|
| 1 | GitHub Actions | Builds 3 Docker images and pushes to GHCR |
| 2 | GitHub Actions | SSHs to VPS, copies `docker-compose.prod.yml` + `nginx/nginx.conf` |
| 3 | VPS | `docker compose pull && up -d` using images + your `.env` |
| 4 | nginx-proxy | Sees `VIRTUAL_HOST` / `LETSENCRYPT_HOST` on the nginx container and issues HTTPS |

**VPS deploy path:** `~/learner-roadmap/backend`

**Images (after push to `main`):**

- `ghcr.io/<github-owner-lowercase>/learner-roadmap-api-gateway:latest`
- `ghcr.io/<github-owner-lowercase>/learner-roadmap-learning-service:latest`
- `ghcr.io/<github-owner-lowercase>/learner-roadmap-ai-service:latest`

Example for owner `Yihun-Alemayehu`: `ghcr.io/yihun-alemayehu/learner-roadmap-api-gateway:latest`

**Workflow file:** `.github/workflows/deploy.yml` (runs on push to `main` when `backend/**` changes, or manually via **workflow_dispatch**).

---

## 2. What you need

- A **DigitalOcean droplet** (or any Linux VPS) with SSH access
- A **domain** (or subdomain) for the API, e.g. `api.yourdomain.com`
- This **GitHub repository** with Actions enabled
- API keys you plan to use: **Gemini**, **Serper** (search), **Google/GitHub OAuth** (optional)

---

## 3. VPS setup — Docker

SSH into the droplet and install Docker if it is not already installed:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

Confirm:

```bash
docker --version
docker compose version
```

---

## 4. VPS setup — shared reverse proxy (SSL)

All sites on this VPS share one reverse proxy. Every app container joins the `webgateway` network and sets `VIRTUAL_HOST` so the proxy routes traffic and requests certificates automatically.

### 4.1 Create the Docker network

```bash
docker network create webgateway
```

(If it already exists, Docker will say so — that is fine.)

### 4.2 Start nginx-proxy and the ACME (Let’s Encrypt) companion

```bash
mkdir -p ~/proxy
cd ~/proxy
```

Create `~/proxy/docker-compose.yml` with this content:

```yaml
services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - certs:/etc/nginx/certs
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
    networks:
      - webgateway
    restart: always

  acme-companion:
    image: nginxproxy/acme-companion
    container_name: nginx-proxy-acme
    volumes_from:
      - nginx-proxy
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - acme:/etc/acme.sh
    environment:
      - DEFAULT_EMAIL=your-email@example.com
    networks:
      - webgateway
    restart: always

networks:
  webgateway:
    external: true

volumes:
  certs:
  vhost:
  html:
  acme:
```

Replace `your-email@example.com` with your real email (Let’s Encrypt renewal notices).

Start the proxy:

```bash
cd ~/proxy
docker compose up -d
```

Check it is running:

```bash
docker ps --filter name=nginx-proxy
```

**How SSL works:** Any container on `webgateway` with `LETSENCRYPT_HOST` and `LETSENCRYPT_EMAIL` gets a certificate automatically. You do not run `certbot` manually.

---

## 5. DNS

In your DNS provider, add an **A record** for the API hostname pointing to the droplet’s **public IP**:

| Type | Name | Value |
|------|------|--------|
| A | `api` (or your chosen subdomain) | `<droplet-ip>` |

Example: `api.yourdomain.com` → `164.92.x.x`

Wait for DNS to propagate before the first deploy (use `dig api.yourdomain.com` or an online DNS checker).

---

## 6. GitHub Actions secrets

In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Example | Description |
|--------|---------|-------------|
| `VPS_HOST` | `164.92.x.x` | Droplet public IP |
| `VPS_USER` | `root` or `startupadmin` | SSH username |
| `VPS_PASSWORD` | *(your password)* | SSH password |
| `VPS_PORT` | `125` | SSH port (use `22` if default) |

The deploy workflow uses these to copy files and run `docker compose` on the VPS.

---

## 7. GitHub Container Registry (GHCR)

By default, GHCR packages are **private**. The VPS must be able to pull images. Choose **one**:

### Option A — Public packages (simplest)

1. GitHub → your profile → **Packages**
2. Open each package: `learner-roadmap-api-gateway`, `learner-roadmap-learning-service`, `learner-roadmap-ai-service`
3. **Package settings** → **Change visibility** → **Public**

### Option B — Private packages (login on VPS once)

Create a GitHub **Personal Access Token** with `read:packages`, then on the VPS:

```bash
echo YOUR_GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

---

## 8. Production `.env` on the VPS

The deploy workflow **fails** if this file is missing. Create it **before** the first GitHub deploy.

```bash
mkdir -p ~/learner-roadmap/backend/nginx
nano ~/learner-roadmap/backend/.env
```

Paste the template below and replace every placeholder. Use your real API hostname everywhere you see `api.yourdomain.com`.

```env
# ── GHCR images (owner is lowercase on GHCR) ──────────────────────────────────
DOCKER_REGISTRY=ghcr.io
IMAGE_PREFIX=yihun-alemayehu/learner-roadmap
IMAGE_TAG=latest

# ── Public API hostname (must match DNS A record) ─────────────────────────────
API_VIRTUAL_HOST=api.yourdomain.com
LETSENCRYPT_EMAIL=you@example.com

# ── Database ──────────────────────────────────────────────────────────────────
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-me-strong-password
POSTGRES_DB=learner_roadmap

# ── Auth ──────────────────────────────────────────────────────────────────────
JWT_SECRET=change-me-long-random-string
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# OAuth — URLs must use https://api.yourdomain.com
FRONTEND_CALLBACK_URL=https://your-frontend.com/auth/callback
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/oauth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/oauth/github/callback

# Comma-separated origins allowed in browsers
CORS_ALLOWED_ORIGINS=https://your-frontend.com

# ── AI (ai-service) ───────────────────────────────────────────────────────────
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
PHI4_BASE_URL=
OLLAMA_BASE_URL=
OLLAMA_MODEL=qwen2.5:3b
LOG_LEVEL=INFO

# ── Search (learning-service) ─────────────────────────────────────────────────
SERPER_API_KEY=
```

**`IMAGE_PREFIX`:** Must match your GitHub username in lowercase + `/learner-roadmap` (same as `.github/workflows/deploy.yml`).

**OAuth:** Register redirect URIs in Google Cloud Console / GitHub OAuth app using the exact `GOOGLE_CALLBACK_URL` / `GITHUB_CALLBACK_URL` values above.

Save the file (`Ctrl+O`, `Enter`, `Ctrl+X` in nano).

---

## 9. First deploy

1. Commit and push your code to the **`main`** branch (with changes under `backend/`), **or**
2. GitHub → **Actions** → **Deploy Backend** → **Run workflow**

The workflow will:

1. Build and push `api-gateway`, `learning-service`, `ai-service` to GHCR
2. Copy `docker-compose.prod.yml` and `nginx/nginx.conf` to `~/learner-roadmap/backend`
3. Run on the VPS:
   ```bash
   cd ~/learner-roadmap/backend
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d --remove-orphans
   docker image prune -f
   ```

First startup may take a few minutes: `learning-service` runs database schema sync and seeds before listening.

---

## 10. Verify the deployment

From your laptop:

```bash
curl -s https://api.yourdomain.com/api/v1/health
curl -s https://api.yourdomain.com/api/v1/ai/health
```

Expect JSON with `"status": "ok"` (or similar) and HTTP 200.

On the VPS:

```bash
cd ~/learner-roadmap/backend
docker compose -f docker-compose.prod.yml ps
```

All services should be `running` (or `healthy` where defined).

Test in a **private/incognito** browser window so cached TLS errors do not mislead you.

---

## 11. Every deploy after the first

Push to `main` (backend changes) or re-run **Deploy Backend** manually. You only need to edit `~/learner-roadmap/backend/.env` when secrets or hostnames change — the workflow does not overwrite `.env`.

To restart without a new image:

```bash
cd ~/learner-roadmap/backend
docker compose -f docker-compose.prod.yml up -d
```

---

## 12. Useful VPS commands

```bash
# All containers for this stack
cd ~/learner-roadmap/backend
docker compose -f docker-compose.prod.yml ps

# Follow logs (pick a service)
docker compose -f docker-compose.prod.yml logs -f learning-service
docker compose -f docker-compose.prod.yml logs -f api-gateway
docker compose -f docker-compose.prod.yml logs -f ai-service
docker compose -f docker-compose.prod.yml logs -f nginx

# Stop the stack (keeps database volume)
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (destroys database — careful)
docker compose -f docker-compose.prod.yml down -v

# Proxy / SSL logs
docker logs -f nginx-proxy-acme
docker logs nginx-proxy
```

---

## 13. Troubleshooting

| Problem | What to do |
|---------|------------|
| Workflow: **`.env is missing`** | Create `~/learner-roadmap/backend/.env` (section 8) and re-run the workflow |
| **`pull access denied`** / image not found | Make GHCR packages public or run `docker login ghcr.io` on the VPS (section 7) |
| **`network webgateway not found`** | Run `docker network create webgateway` and ensure `~/proxy` is up (section 4) |
| **502 Bad Gateway** | `docker compose -f docker-compose.prod.yml ps` — wait for `learning-service` to finish DB seed; check `logs -f learning-service` |
| **No HTTPS / certificate pending** | Confirm DNS A record points to the VPS; check `docker logs nginx-proxy-acme`; ensure `API_VIRTUAL_HOST` matches DNS exactly |
| **CORS errors in browser** | Add your frontend origin to `CORS_ALLOWED_ORIGINS` in `.env`, then `docker compose -f docker-compose.prod.yml up -d` |
| **OAuth redirect mismatch** | Callback URLs in `.env` must match Google/GitHub app settings exactly (https, no trailing slash mismatch) |
| **AI errors** | Set `GEMINI_API_KEY` in `.env`; optional: `OLLAMA_BASE_URL` if Ollama runs on the host |

---

## 14. Fix broken or stale SSL certificates

If you restored the droplet from a snapshot or certificates look wrong, clear stale certs and force renewal:

```bash
# 1. Remove stale certificate files from the proxy volume
docker exec nginx-proxy sh -c "rm -rf /etc/nginx/certs/*"

# 2. Restart proxy
docker restart nginx-proxy

# 3. Restart ACME companion
docker restart nginx-proxy-acme

# 4. Force renewal
docker exec nginx-proxy-acme /app/force_renew

# 5. Watch logs until certificates are issued
docker logs -f nginx-proxy-acme
```

Then restart the backend stack so nginx-proxy re-reads vhosts:

```bash
cd ~/learner-roadmap/backend
docker compose -f docker-compose.prod.yml up -d
```

Test again in an **incognito** window: `https://api.yourdomain.com/api/v1/health`

---

## 15. Local production-like test

On a machine with Docker, from the repo `backend/` folder:

```bash
docker network create webgateway 2>/dev/null || true
# Start ~/proxy stack separately, or skip HTTPS and only test internal ports
cp .env.example .env   # for local dev values, or copy the production template from section 8
# Edit API_VIRTUAL_HOST / passwords for local use
docker compose -f docker-compose.prod.yml up -d
```

For full HTTPS locally you still need the `~/proxy` stack and a hostname that resolves to your machine (e.g. via `/etc/hosts`).

---

## Quick checklist

- [ ] Docker installed on VPS
- [ ] `docker network create webgateway`
- [ ] `~/proxy/docker-compose.yml` created and `docker compose up -d`
- [ ] DNS A record → droplet IP
- [ ] GitHub secrets: `VPS_HOST`, `VPS_USER`, `VPS_PASSWORD`, `VPS_PORT`
- [ ] GHCR public **or** `docker login ghcr.io` on VPS
- [ ] `~/learner-roadmap/backend/.env` created and filled in
- [ ] Push to `main` or run **Deploy Backend** workflow
- [ ] `curl https://api.yourdomain.com/api/v1/health` returns 200
