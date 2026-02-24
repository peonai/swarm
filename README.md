# 🐝 Swarm AI

Cross-agent user profile synchronization. Teach one agent about yourself — every agent knows.

## The Problem

You use 5 AI agents. Each one asks the same questions. You repeat yourself endlessly. Swarm fixes this with a shared profile layer that any agent can read and write.

## Live Demo

Try it without installing: **[hive.peonai.net](https://hive.peonai.net)**

Test account: `peon` / `123456`

> ⚠️ **Privacy Warning:** This is a shared public instance. Do NOT connect your real AI agents or enter personal information. Use a disposable agent or VM for testing.

## Quick Start

```bash
# Install & setup (interactive)
npx @peonai/swarm

# Uninstall
npx @peonai/swarm uninstall
```

## Connect an Agent (30 seconds)

1. Open dashboard → create admin account
2. Copy the onboarding prompt from Dashboard or Agents page
3. Send it to any AI agent
4. Done. The agent reads `llms.txt`, learns the API, and starts syncing.

No SDK. No config files. No skill installation. Just a URL.

## Features

- **Multi-user** — Setup wizard, JWT login, user management
- **User profiles** — Layered (identity, preferences, work, context), with confidence scores
- **Shared memory** — Cross-agent memories with FTS5 full-text search
- **Semantic search** — Optional embedding API (OpenAI-compatible)
- **Agent personas** — Per-agent personality and instructions
- **llms.txt** — Dynamic API docs that agents can self-read to onboard
- **Tenant isolation** — All data scoped by user
- **Audit log** — Track every API action and profile change
- **Admin controls** — Disable users, reset tokens, localhost-only admin API
- **Mobile-friendly** — Responsive dashboard with collapsible sidebar
- **SQLite / PostgreSQL** — SQLite for dev, Postgres for scale
- **Webhooks** — Real-time notifications when profiles or memories change
- **OpenAPI spec** — Machine-readable API docs at `/api/openapi`
- **Python SDK** — `pip install swarm-ai-client`
- **Observe API** — Auto-extract profile data from natural language

## API

```
GET  /api/v1/profile          # Read user profile
PATCH /api/v1/profile         # Write profile entries
POST /api/v1/profile/observe  # Auto-extract from text
GET  /api/v1/memory           # Search memories
POST /api/v1/memory           # Write memory
GET  /llms.txt?key=<token>    # Self-service API docs for agents
POST /api/v1/webhooks         # Register webhook
GET  /api/v1/webhooks         # List webhooks
GET  /api/openapi             # OpenAPI 3.0 spec
GET  /api/health              # Health check
```

Auth: `Authorization: Bearer <api_key>` (agent key or user token)

## Architecture

```
Agent A ──┐                    ┌── Profile (layered)
Agent B ──┤── Swarm API ──────┤── Memory (FTS5)
Agent C ──┘   (REST + JWT)     └── Audit Log
```

- **npm**: `@peonai/swarm@0.5.0`
- **Stack**: Next.js standalone, SQLite/PostgreSQL
- **Deploy**: systemd service via interactive CLI

## License

MIT
