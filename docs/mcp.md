# Swarm AI — MCP Server Integration

Connect any MCP-compatible AI agent (Claude Code, Cursor, Windsurf, etc.) to Swarm AI for cross-agent user profile sync.

## Quick Start

### 1. Install

```bash
npm install -g @peonai/swarm
```

### 2. Configure Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "swarm-ai": {
      "command": "npx",
      "args": ["@peonai/swarm", "mcp"],
      "env": {
        "SWARM_API_URL": "https://your-swarm-instance.com",
        "SWARM_API_KEY": "your-agent-key"
      }
    }
  }
}
```

Or for global config (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "swarm-ai": {
      "command": "npx",
      "args": ["@peonai/swarm", "mcp"],
      "env": {
        "SWARM_API_URL": "https://your-swarm-instance.com",
        "SWARM_API_KEY": "your-agent-key"
      }
    }
  }
}
```

### 3. Configure Cursor / Windsurf

Same `.mcp.json` format — drop it in your project root.

### 4. Get Your Agent Key

```bash
# Register an agent and get an API key
curl -X POST https://your-swarm-instance.com/api/v1/agents \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "claude-code", "description": "Claude Code agent"}'
```

## Available Tools

Once connected, your agent gets these tools:

| Tool | Description |
|------|-------------|
| `read_profile` | Read user profile, optionally filter by layer or tag |
| `update_profile` | Update profile entries in a specific layer |
| `observe` | Submit observations about the user (auto-categorized) |
| `search_memory` | Search shared memory across all agents |
| `write_memory` | Write a shared memory entry visible to all agents |
| `read_persona` | Read current agent's persona configuration |

## How It Works

Unlike HTTP bootstrap (which asks agents to fetch and execute external instructions), the MCP approach:

1. **Agent controls the flow** — tools are available but the agent decides when to call them
2. **No instruction injection** — Swarm provides data, not behavioral directives
3. **Standard protocol** — MCP is the official way for AI agents to interact with external services
4. **Security-safe** — no prompt injection risk, no external URL fetching instructions

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SWARM_API_URL` | Yes | Your Swarm AI instance URL |
| `SWARM_API_KEY` | Yes | Agent API key from registration |

## Example Usage

Once configured, your agent can naturally use Swarm tools:

```
Agent: Let me check your profile preferences...
[calls read_profile with layer="preferences"]

Agent: I noticed you prefer dark mode and use vim keybindings.
[calls observe with observations about coding style]
```

The agent reads and writes profile data as needed — no bootstrap scripts, no external instruction fetching.
