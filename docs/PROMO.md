# Swarm AI — Promotion Kit

## Hacker News (Show HN)

**Title:** Show HN: Swarm AI – Shared memory layer for AI agents (self-hosted, open source)

**Text:**
I built a self-hosted server that lets all your AI agents share a unified user profile.

The problem: I use Claude, ChatGPT, Gemini, and local agents daily. Every one starts from zero. Every one asks the same questions. N devices × M agents = N×M information silos.

Swarm AI fixes this with a simple REST API. Any agent can read and write to a shared profile store — layered (identity, preferences, work, context), with confidence scoring and source attribution.

The killer feature: zero-config agent onboarding. Copy a prompt from the dashboard, paste it to any AI agent, done. The prompt contains a llms.txt URL — the agent reads it, learns the API, and starts syncing in one conversation turn. No SDK, no config files.

Stack: Next.js standalone + SQLite, deploys in one command (`npx @peonai/swarm`). Multi-user, tenant isolation, JWT auth, audit logging.

GitHub: https://github.com/peonai/swarm
npm: `npx @peonai/swarm`
Blog post: https://blog.peonai.net/posts/2026-02-22-swarm-ai/
Live demo: https://hive.peonai.net (login: peon / 123456)

⚠️ The demo is a shared public instance — do not connect real agents or enter personal data.

---

## Reddit r/selfhosted

**Title:** Swarm AI — self-hosted shared memory for AI agents. Teach one agent about yourself, all agents know.

**Body:**
If you use multiple AI agents (Claude, ChatGPT, Copilot, local LLMs), you know the pain of repeating yourself to each one.

I built Swarm AI to fix this. It's a self-hosted server (Next.js + SQLite) that provides a shared user profile API. Any agent that can make HTTP requests can read/write your profile.

**Features:**
- Layered profiles (identity, preferences, work, context) with confidence scoring
- Shared memory with full-text search
- Multi-user with tenant isolation
- Zero-config agent onboarding via llms.txt
- One-command install: `npx @peonai/swarm`
- SQLite for dev, PostgreSQL for scale

**Privacy-first:** Everything runs on your hardware. No cloud dependency. No telemetry.

GitHub: https://github.com/peonai/swarm
Live demo: https://hive.peonai.net (test account: peon / 123456 — shared instance, don't use real data)

---

## Reddit r/LocalLLaMA

**Title:** Built a shared memory layer so my local LLMs stop asking the same questions

**Body:**
Anyone else frustrated that every agent/model starts from scratch? I use Ollama locally, Claude for complex stuff, and various other tools — and I'm constantly re-explaining my preferences, projects, and context.

So I built Swarm AI: a lightweight self-hosted server (SQLite, single process) that any agent can query via REST API. Write your profile once, every agent reads it at session start.

The fun part: onboarding a new agent takes 30 seconds. You copy a prompt from the dashboard that contains a llms.txt URL. The agent reads the docs, gets its API key, and starts syncing. No code needed.

Works with any agent that can make HTTP calls — local or cloud.

`npx @peonai/swarm` to try it.

GitHub: https://github.com/peonai/swarm

---

## Reddit r/artificial

**Title:** The multi-agent memory problem: why every AI agent starts from zero, and an open-source fix

**Body:**
As AI agents proliferate, there's a growing UX problem nobody's solving well: context fragmentation.

Each agent maintains its own context window. Your coding assistant doesn't know your design preferences. Your writing tool doesn't know your tech stack. You repeat the same corrections across every tool.

I built Swarm AI as an open protocol attempt at solving this. It's a self-hosted REST API that any agent can read/write to — a shared user profile with layered data, confidence scoring, and source attribution.

The key insight: agents can self-onboard via llms.txt. You give them a URL, they read the API docs, and start participating. No SDK integration needed.

This feels like it should be a standard, not a product. Open source, MIT licensed.

GitHub: https://github.com/peonai/swarm
Blog: https://blog.peonai.net/posts/2026-02-22-swarm-ai/

---

## Twitter/X Thread

**Tweet 1:**
I built an open-source shared memory layer for AI agents.

The problem: N devices × M agents = N×M information silos. Every agent asks the same questions.

The fix: a self-hosted API that any agent can read/write. Teach one, all remember.

🔗 github.com/peonai/swarm

**Tweet 2:**
The killer feature: zero-config onboarding.

1. Copy a prompt from the dashboard
2. Paste it to any AI agent
3. Done

The agent reads a llms.txt URL, learns the API, and starts syncing. No SDK. No config files. 30 seconds.

**Tweet 3:**
Stack:
- Next.js standalone + SQLite
- One command: `npx @peonai/swarm`
- Multi-user, tenant isolation
- Confidence scoring (facts > guesses)
- Full-text + semantic search
- Audit logging

Self-hosted. Your data stays yours. MIT licensed.

---

## Discord (AI communities)

Hey! Built something that might be useful for folks running multiple AI agents.

**Swarm AI** — a self-hosted shared memory layer. Any agent that can make HTTP requests can read/write to a shared user profile. Teach one agent about yourself, all agents know.

The cool part: onboarding is just copying a prompt. The agent reads a `llms.txt` URL and self-configures. No SDK needed.

`npx @peonai/swarm` to try it. MIT licensed.
GitHub: <https://github.com/peonai/swarm>
Demo: <https://hive.peonai.net> (login: peon / 123456 — shared instance, don't use real data)
