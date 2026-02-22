'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, authHeaders } from '../../components/auth-context';
import { Badge } from '../../components/ui';

export default function ProfilePage() {
  const { token } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const p = await fetch('/api/v1/admin/profile', { headers: authHeaders(token) }).then(r => r.json()).catch(() => []);
    setProfiles(Array.isArray(p) ? p : []);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const layers = profiles.reduce((acc: Record<string, any[]>, p: any) => {
    (acc[p.layer] = acc[p.layer] || []).push(p); return acc;
  }, {});
  const keys = Object.keys(layers);
  const toggle = (l: string) => setOpen(p => ({ ...p, [l]: !p[l] }));

  return (
    <div className="tab-content">
      <div className="mb-6">
        <h1 className="text-xl font-bold">User Profiles</h1>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>Browse all profile data by layer</p>
      </div>
      {keys.length === 0 && <div className="empty-state"><p>No data yet</p></div>}
      <div className="space-y-2 stagger-in">
        {keys.map(layer => (
          <div key={layer} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <button onClick={() => toggle(layer)} className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[rgba(240,168,48,0.04)]"
              style={{ background: 'rgba(240,168,48,0.03)' }}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium" style={{ color: 'var(--amber)' }}>{layer}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface)', color: 'var(--text2)' }}>{layers[layer].length}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"
                style={{ transform: open[layer] !== false ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
                <path d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div className={`layer-content ${open[layer] !== false ? 'open' : ''}`}>
              <div>
                {layers[layer].map((p: any, i: number) => (
                  <div key={i} className="data-row text-xs" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="font-mono min-w-[100px]" style={{ color: 'var(--blue)' }}>{p.key}</span>
                    <span className="flex-1 font-mono truncate" style={{ color: 'var(--green)', fontSize: '0.65rem' }}>{JSON.stringify(p.value)}</span>
                    {p.confidence != null && <span className="text-[10px]" style={{ color: 'var(--text2)' }}>conf:{p.confidence}</span>}
                    {p.source && <Badge text={p.source} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
