'use client';
import { useState, useEffect } from 'react';
import { useAuth, authHeaders } from '../../components/auth-context';

export default function SettingsPage() {
  const { token, user } = useAuth();
  const [cfg, setCfg] = useState({ url: '', key: '', model: '' });
  const [enabled, setEnabled] = useState(false);
  const [msg, setMsg] = useState('');
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/v1/admin/settings', { headers: authHeaders(token) }).then(r => r.json()).then(d => {
      if (d.embedding) {
        setCfg({ url: d.embedding.url || '', key: '', model: d.embedding.model || '' });
        setEnabled(d.embedding.enabled);
      }
    }).catch(() => {});
  }, [token]);

  const save = async () => {
    const scope = user?.role === 'admin' ? 'global' : 'user';
    await fetch('/api/v1/admin/settings', { method: 'PATCH', headers: authHeaders(token),
      body: JSON.stringify({ embedding: { url: cfg.url, key: cfg.key || undefined, model: cfg.model }, scope }) });
    setMsg('Saved!'); setTimeout(() => setMsg(''), 4000);
  };
  const test = async () => {
    setTesting(true); setMsg('');
    try {
      const res = await fetch(cfg.url, { method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
        body: JSON.stringify({ model: cfg.model || 'text-embedding-3-small', input: 'test' }) });
      setMsg(res.ok ? 'Connection OK' : `Failed: ${res.status}`);
    } catch (e: any) { setMsg(`Failed: ${e.message}`); }
    setTesting(false);
  };
  const copyToken = () => {
    if (user?.api_token) { navigator.clipboard.writeText(user.api_token); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <div className="tab-content">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>Server and embedding configuration</p>
      </div>

      {user?.api_token && (
        <div className="glow-card p-5 mb-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold mb-1">Your API Token</h2>
          <p className="text-[10px] mb-3" style={{ color: 'var(--text2)' }}>Use this token to connect agents to your profile</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg text-xs font-mono truncate" style={inputStyle}>{user.api_token}</code>
            <button onClick={copyToken} className="px-3 py-2 rounded-lg text-xs whitespace-nowrap"
              style={{ background: 'var(--amber-glow)', color: 'var(--amber)', border: '1px solid rgba(240,168,48,0.2)' }}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <div className="glow-card p-5" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold">Embedding API</h2>
          <span className="badge" style={{ background: enabled ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: enabled ? 'var(--green)' : 'var(--red)' }}>
            {enabled ? 'Enabled' : 'Not configured'}
          </span>
        </div>
        <div className="space-y-3">
          {[{ label: 'API URL', key: 'url', ph: 'https://api.openai.com/v1/embeddings' },
            { label: 'API Key', key: 'key', ph: 'sk-...', type: 'password' },
            { label: 'Model', key: 'model', ph: 'text-embedding-3-small' }].map(f => (
            <div key={f.key}>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: 'var(--text2)' }}>{f.label}</label>
              <input type={f.type || 'text'} value={(cfg as any)[f.key]} onChange={e => setCfg({ ...cfg, [f.key]: e.target.value })}
                placeholder={f.ph} className="w-full rounded-lg px-3 py-2 text-xs font-mono" style={inputStyle} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button onClick={save} className="btn-amber px-4 py-2 text-xs">Save</button>
          {cfg.url && cfg.key && <button onClick={test} disabled={testing} className="px-3 py-2 rounded-lg text-xs"
            style={{ background: 'var(--amber-glow)', color: 'var(--amber)', border: '1px solid rgba(240,168,48,0.2)' }}>
            {testing ? 'Testing...' : 'Test'}</button>}
          {msg && <span className="text-xs ml-2" style={{ color: msg.includes('OK') || msg.includes('Saved') ? 'var(--green)' : 'var(--red)' }}>{msg}</span>}
        </div>
      </div>
    </div>
  );
}
