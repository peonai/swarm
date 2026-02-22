'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, authHeaders } from '../../components/auth-context';

const LAYER_META: Record<string, { icon: string; color: string; label: string }> = {
  identity: { icon: '👤', color: '#f0a830', label: 'Identity' },
  preferences: { icon: '⚙️', color: '#60a5fa', label: 'Preferences' },
  work: { icon: '💼', color: '#34d399', label: 'Work' },
  context: { icon: '📍', color: '#a78bfa', label: 'Context' },
};
const getMeta = (layer: string) => LAYER_META[layer] || { icon: '🔷', color: '#f0a830', label: layer };

export default function ProfilePage() {
  const { token } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    const p = await fetch('/api/v1/admin/profile', { headers: authHeaders(token) }).then(r => r.json()).catch(() => []);
    setProfiles(Array.isArray(p) ? p : []);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const layers = profiles.reduce((acc: Record<string, any[]>, p: any) => {
    (acc[p.layer] = acc[p.layer] || []).push(p); return acc;
  }, {});

  const fmt = (v: any) => typeof v === 'object' ? JSON.stringify(v) : String(v);
  const timeAgo = (t: string) => {
    if (!t) return '';
    const d = Math.floor((Date.now() - new Date(t + 'Z').getTime()) / 60000);
    if (d < 60) return `${d}m ago`;
    if (d < 1440) return `${Math.floor(d / 60)}h ago`;
    return `${Math.floor(d / 1440)}d ago`;
  };

  return (
    <div className="tab-content">
      <div className="mb-6">
        <h1 className="text-xl font-bold">User Profile</h1>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>
          {profiles.length} attributes across {Object.keys(layers).length} layers
        </p>
      </div>

      {Object.keys(layers).length === 0 && (
        <div className="empty-state"><p>No profile data yet. Connect an agent to start building your profile.</p></div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(layers).map(([layer, items]) => {
          const meta = getMeta(layer);
          return (
            <div key={layer} className="glow-card p-0 overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {/* Layer header */}
              <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: `${meta.color}08` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
                  {meta.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{meta.label}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text2)' }}>{items.length} attributes</div>
                </div>
                <div className="hex-badge" style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
                  {layer}
                </div>
              </div>

              {/* Attributes as hex pills */}
              <div className="p-3 flex flex-wrap gap-2">
                {items.map((p: any, i: number) => {
                  const isOpen = expanded === `${layer}.${p.key}`;
                  const val = fmt(p.value);
                  return (
                    <div key={i} className="transition-all duration-200"
                      style={{ width: isOpen ? '100%' : undefined }}>
                      <button
                        onClick={() => setExpanded(isOpen ? null : `${layer}.${p.key}`)}
                        className="w-full text-left rounded-lg px-3 py-2 transition-all duration-200"
                        style={{
                          background: isOpen ? `${meta.color}10` : 'var(--surface)',
                          border: `1px solid ${isOpen ? meta.color + '40' : 'var(--border)'}`,
                        }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-medium" style={{ color: meta.color }}>{p.key}</span>
                          {!isOpen && (
                            <span className="text-[10px] font-mono truncate flex-1" style={{ color: 'var(--text2)', maxWidth: 160 }}>{val}</span>
                          )}
                          {p.confidence != null && (
                            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
                              style={{ background: `${meta.color}15`, color: meta.color }}>
                              {Math.round(p.confidence * 100)}%
                            </span>
                          )}
                        </div>
                        {isOpen && (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs font-mono break-all" style={{ color: 'var(--text)', lineHeight: 1.6 }}>{val}</div>
                            <div className="flex gap-3 text-[9px] pt-1" style={{ color: 'var(--text2)' }}>
                              {p.source && <span>source: {p.source}</span>}
                              {p.updated_at && <span>{timeAgo(p.updated_at)}</span>}
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
