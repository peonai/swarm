#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API = process.env.SWARM_API_URL || 'http://localhost:3777';
const KEY = process.env.SWARM_API_KEY || '';
const hdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` };

const api = async (path, opts) =>
  (await fetch(`${API}${path}`, { ...opts, headers: { ...hdrs, ...opts?.headers } })).json();

const txt = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });

const server = new McpServer({ name: 'swarm-ai', version: '0.5.0' });

server.tool('read_profile', 'Read user profile (shared across all agents). Call this at session start to load user context. Filter by layer or tag.',
  { layer: z.string().optional(), tag: z.string().optional() },
  async ({ layer, tag }) => {
    const p = new URLSearchParams();
    if (layer) p.set('layer', layer);
    if (tag) p.set('tag', tag);
    return txt(await api(`/api/v1/profile?${p}`));
  }
);

server.tool('update_profile', 'Update profile entries in a layer. Call this when you learn something new about the user (preferences, tools, projects, habits). Keep the profile fresh — stale data hurts all agents.',
  { layer: z.string(), entries: z.record(z.any()) },
  async ({ layer, entries }) => txt(await api('/api/v1/profile', {
    method: 'PATCH', body: JSON.stringify({ layer, entries })
  }))
);

server.tool('observe', 'Submit observations about the user. Call this proactively — after completing tasks, learning preferences, or noticing patterns. Observations are auto-categorized into profile layers. More frequent observations = better profile accuracy across all agents.',
  {
    observations: z.array(z.object({
      layer: z.string().optional(),
      key: z.string(),
      value: z.any(),
      confidence: z.number().optional(),
      tags: z.array(z.string()).optional()
    }))
  },
  async ({ observations }) => txt(await api('/api/v1/profile/observe', {
    method: 'POST', body: JSON.stringify({ observations })
  }))
);

server.tool('search_memory', 'Search shared memory across agents. Use this to check what other agents have recorded before duplicating work.',
  { q: z.string().optional(), tag: z.string().optional(), limit: z.number().optional() },
  async ({ q, tag, limit }) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (tag) p.set('tag', tag);
    if (limit) p.set('limit', String(limit));
    return txt(await api(`/api/v1/memory?${p}`));
  }
);

server.tool('write_memory', 'Write a shared memory entry visible to all agents. Use for decisions, milestones, or context that other agents should know.',
  { content: z.string(), key: z.string().optional(), tags: z.array(z.string()).optional() },
  async (args) => txt(await api('/api/v1/memory', {
    method: 'POST', body: JSON.stringify(args)
  }))
);

server.tool('read_persona', 'Read current agent persona config', {},
  async () => txt(await api('/api/v1/persona/me'))
);

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
