'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, authHeaders } from '../../components/auth-context';
import { Badge, agentColor } from '../../components/ui';

export default function AgentsPage() {
  const { token, user } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [newAgent, setNewAgent] = useState({ id: '', name: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [personaText, setPersonaText] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);

  const load = useCallback(async () => {
    const a = await fetch('/api/v1/admin/agents', { headers: authHeaders(token) }).then(r => r.json()).catch(() => []);
    setAgents(Array.isArray(a) ? a : []);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const addAgent = async () => {
    if (!newAgent.id) return;
    const res = await fetch('/api/v1/admin/agents', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(newAgent) });
    const data = await res.json();
    alert(`API Key: ${data.apiKey}\n\nSave it now — it won't be shown again!`);
    setNewAgent({ id: '', name: '' }); load();
  };
  const deleteAgent = async (id: string) => {
    if (!confirm(`Delete agent "${id}"?`)) return;
    await fetch(`/api/v1/admin/agents/${id}`, { method: 'DELETE', headers: authHeaders(token) }); load();
  };
  const startEdit = (a: any) => {
    setEditing(a.id);
    setPersonaText(a.persona ? JSON.stringify(a.persona, null, 2) : '{\n  "personality": "",\n  "instructions": ""\n}');
  };
  const savePersona = async (id: string) => {
    try {
      await fetch('/api/v1/admin/agents', { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ id, persona: JSON.parse(personaText) }) });
      setEditing(null); load();
    } catch { alert('Invalid JSON'); }
  };

  return (
    <div className="tab-content">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Agent Management</h1>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>Register, view and manage agents</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input placeholder="Agent ID" value={newAgent.id} onChange={e => setNewAgent({ ...newAgent, id: e.target.value })}
          className="flex-1 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <input placeholder="Name" value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
          className="flex-1 rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <button onClick={addAgent} className="btn-amber px-4 py-2 text-xs">+ Add</button>
      </div>
      <div className="space-y-2 stagger-in">
        {agents.map((a: any) => (
          <div key={a.id} className="glow-card" style={{ border: '1px solid var(--border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: `${agentColor(a.id)}18`, color: agentColor(a.id) }}>
                  {(a.name || a.id).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-xs">{a.name || a.id}</div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--text2)' }}>{a.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge" style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--green)' }}>{a.permissions || 'read,write'}</span>
                <button onClick={() => { navigator.clipboard.writeText(`${location.origin}/llms.txt?key=${a.api_key}`); alert('llms.txt URL copied!'); }}
                  className="text-[10px] px-2 py-1 rounded-md" style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--blue)' }}>Copy llms.txt</button>
                <button onClick={() => editing === a.id ? setEditing(null) : startEdit(a)} className="text-[10px] px-2 py-1 rounded-md"
                  style={{ background: 'var(--amber-glow)', color: 'var(--amber)' }}>Edit Persona</button>
                <button onClick={() => deleteAgent(a.id)} className="text-[10px] px-2 py-1 rounded-md"
                  style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)' }}>Delete</button>
              </div>
            </div>
            {editing === a.id && (
              <div className="px-4 pb-3">
                <textarea value={personaText} onChange={e => setPersonaText(e.target.value)} rows={5}
                  className="w-full rounded-lg px-3 py-2 text-[11px] font-mono resize-none mb-2"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <div className="flex gap-2">
                  <button onClick={() => savePersona(a.id)} className="btn-amber px-3 py-1.5 text-[10px]">Save</button>
                  <button onClick={() => setEditing(null)} className="text-[10px] px-3 py-1.5" style={{ color: 'var(--text2)' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {agents.length === 0 && <div className="empty-state"><p className="text-xs">No agents registered</p></div>}
      </div>

      {user?.api_token && (
        <div className="glow-card p-5 mt-6" style={{ border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.03)' }}>
          <h2 className="text-sm font-semibold mb-1">🐝 Connect an Agent</h2>
          <p className="text-[10px] mb-3" style={{ color: 'var(--text2)' }}>Copy the prompt below and send it to any AI agent:</p>
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
