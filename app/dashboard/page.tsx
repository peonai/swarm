'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, authHeaders } from '../components/auth-context';
import { Badge, Stat } from '../components/ui';
import { locales } from '../i18n';

export default function OverviewPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [t] = useState(locales.en);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [promptCopied, setPromptCopied] = useState(false);

  const load = useCallback(async () => {
    const h = authHeaders(token);
    const [p, a, m, hh] = await Promise.all([
      fetch('/api/v1/admin/profile', { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/v1/admin/agents', { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/v1/memory?limit=50', { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/health').then(r => r.json()).catch(() => null),
    ]);
    setProfiles(Array.isArray(p) ? p : []);
    setAgents(Array.isArray(a) ? a : []);
    setMemories(Array.isArray(m) ? m : []);
    setHealth(hh);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const layerCount = new Set(profiles.map((p: any) => p.layer)).size;

  return (
    <div className="tab-content">
      <div className="mb-6">
        <h1 className="text-xl font-bold">{t.overview.title}</h1>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>{t.overview.subtitle}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 stagger-in">
        <Stat label={t.overview.agents} value={agents.length} icon="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" onClick={() => router.push('/dashboard/agents')} />
        <Stat label={t.overview.profiles} value={profiles.length} icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" onClick={() => router.push('/dashboard/profile')} />
        <Stat label={t.overview.layers} value={layerCount} icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        <Stat label={t.overview.memories} value={memories.length} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" onClick={() => router.push('/dashboard/memory')} />
      </div>
      <h2 className="text-sm font-semibold mb-3">{t.overview.recent}</h2>
      <div className="space-y-1">
        {profiles.slice(0, 8).map((p: any, i: number) => (
          <div key={i} className="data-row text-xs">
            <span className="badge" style={{ background: 'var(--amber-glow)', color: 'var(--amber)' }}>{p.layer}</span>
            <span className="font-mono" style={{ color: 'var(--blue)' }}>{p.key}</span>
            <span className="flex-1 truncate font-mono" style={{ color: 'var(--text2)', fontSize: '0.65rem' }}>{JSON.stringify(p.value)}</span>
            {p.source && <Badge text={p.source} />}
          </div>
        ))}
        {profiles.length === 0 && <p className="text-xs" style={{ color: 'var(--text2)' }}>{t.overview.noData}</p>}
      </div>

      {user?.api_token && agents.length === 0 && (
        <div className="glow-card p-5 mt-8" style={{ border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.03)' }}>
          <h2 className="text-sm font-semibold mb-1">🐝 Get Started — Connect an Agent</h2>
          <p className="text-[10px] mb-3" style={{ color: 'var(--text2)' }}>Copy this prompt and send it to any AI agent to connect:</p>
          <div className="rounded-lg px-3 py-2.5 text-xs font-mono mb-3 leading-relaxed" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {`Connect to my Swarm AI profile system. Read the docs at ${typeof location !== 'undefined' ? location.origin : ''}/llms.txt?key=${user.api_token} and use it to learn about me and remember what you learn.`}
          </div>
          <button onClick={() => {
            navigator.clipboard.writeText(`Connect to my Swarm AI profile system. Read the docs at ${location.origin}/llms.txt?key=${user.api_token} and use it to learn about me and remember what you learn.`);
            setPromptCopied(true); setTimeout(() => setPromptCopied(false), 2000);
          }} className="btn-amber px-4 py-2 text-xs">{promptCopied ? '✓ Copied!' : 'Copy Prompt'}</button>
        </div>
      )}
    </div>
  );
}
