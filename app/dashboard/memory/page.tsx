'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, authHeaders } from '../../components/auth-context';
import { Badge } from '../../components/ui';

const TYPE_C: Record<string, string> = { fact: 'var(--blue)', preference: 'var(--amber)', experience: 'var(--green)', observation: 'var(--text2)' };

export default function MemoryPage() {
  const { token } = useAuth();
  const [memories, setMemories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [newMem, setNewMem] = useState({ content: '', tags: '', type: 'observation' });

  const load = useCallback(async () => {
    const m = await fetch('/api/v1/memory?limit=50', { headers: authHeaders(token) }).then(r => r.json()).catch(() => []);
    setMemories(Array.isArray(m) ? m : []);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const doSearch = async () => {
    if (!search.trim()) { setResults(null); return; }
    const r = await fetch(`/api/v1/memory?q=${encodeURIComponent(search)}`, { headers: authHeaders(token) }).then(r => r.json()).catch(() => []);
    setResults(Array.isArray(r) ? r : []);
  };
  const addMemory = async () => {
    if (!newMem.content) return;
    await fetch('/api/v1/memory', { method: 'POST', headers: authHeaders(token),
      body: JSON.stringify({ content: newMem.content, tags: newMem.tags ? newMem.tags.split(',').map(t => t.trim()) : [] }) });
    setNewMem({ content: '', tags: '', type: 'observation' }); load();
  };

  const display = results ?? memories;

  return (
    <div className="tab-content">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Memory</h1>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>Cross-agent shared memories</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input placeholder="Search memories..." value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          className="flex-1 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <button onClick={doSearch} className="px-3 py-2 rounded-lg text-xs font-medium"
          style={{ background: 'var(--amber-glow)', color: 'var(--amber)', border: '1px solid rgba(240,168,48,0.2)' }}>Search</button>
        {results && <button onClick={() => { setResults(null); setSearch(''); }} className="px-2 py-2 text-[10px]" style={{ color: 'var(--text2)' }}>Clear</button>}
      </div>
      <div className="glow-card p-4 mb-6" style={{ border: '1px solid var(--border)' }}>
        <textarea placeholder="Memory content..." value={newMem.content} onChange={e => setNewMem({ ...newMem, content: e.target.value })}
          rows={2} className="w-full rounded-lg px-3 py-2 text-xs resize-none mb-2"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <div className="flex flex-col sm:flex-row gap-2">
          <input placeholder="Tags (comma-separated)" value={newMem.tags} onChange={e => setNewMem({ ...newMem, tags: e.target.value })}
            className="flex-1 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <button onClick={addMemory} className="btn-amber px-4 py-2 text-xs">+ Write</button>
        </div>
      </div>
      <div className="space-y-2 stagger-in">
        {display.map((m: any, i: number) => (
          <div key={m.id || i} className="glow-card px-4 py-3" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              {m.type && <span className="badge" style={{ background: `${TYPE_C[m.type] || 'var(--text2)'}18`, color: TYPE_C[m.type] || 'var(--text2)' }}>{m.type}</span>}
            </div>
            <p className="text-xs mb-1.5">{m.content}</p>
            <div className="flex items-center gap-1.5 flex-wrap text-[10px]" style={{ color: 'var(--text2)' }}>
              {(Array.isArray(m.tags) ? m.tags : []).map((tag: string, j: number) => (
                <span key={j} className="badge" style={{ background: 'var(--amber-glow)', color: 'var(--amber)' }}>{tag}</span>
              ))}
              <span className="ml-auto"><Badge text={m.agent_id || m.source || ''} /></span>
              {m.created_at && <span>{new Date(m.created_at).toLocaleString()}</span>}
            </div>
          </div>
        ))}
        {display.length === 0 && <div className="empty-state"><p className="text-xs">{results ? 'No matches' : 'No memories yet'}</p></div>}
      </div>
    </div>
  );
}
