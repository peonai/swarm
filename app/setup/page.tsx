'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/setup').then(r => r.json()).then(d => {
      if (d.initialized) router.replace('/login');
      else setLoading(false);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!password) { setError('Password required'); return; }
    const res = await fetch('/api/v1/setup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name: name || username }),
    });
    if (res.ok) router.push('/login');
    else { const d = await res.json(); setError(d.error); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text2)' }}>Loading...</div>;

  const inputStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="hex-bg" />
      <div className="glow-card p-8 w-full max-w-sm relative z-10" style={{ border: '1px solid var(--border)' }}>
        <div className="text-center mb-6">
          <svg className="logo-hex mx-auto mb-3" width="40" height="40" viewBox="0 0 100 100" fill="none">
            <path d="M50 5L93.3 27.5V72.5L50 95L6.7 72.5V27.5L50 5Z" stroke="var(--amber)" strokeWidth="4" fill="none"/>
            <circle cx="50" cy="50" r="6" fill="var(--amber)" opacity="0.8"/>
          </svg>
          <div className="text-xl font-bold">Swarm AI Setup</div>
          <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>Create your admin account</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm" style={inputStyle} />
          <input placeholder="Display Name" value={name} onChange={e => setName(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm" style={inputStyle} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm" style={inputStyle} autoFocus />
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
          <button type="submit" className="btn-amber w-full py-2.5 text-sm">Initialize</button>
        </form>
      </div>
      <p className="relative z-10 mt-6 text-[10px]" style={{ color: 'var(--text2)' }}>
        © 2026 PeonAI · <a href="mailto:peon@peonai.net" style={{ textDecoration: 'underline', color: 'inherit' }}>peon@peonai.net</a> · <a href="/privacy" style={{ textDecoration: 'underline', color: 'inherit' }}>Privacy</a> · <a href="/terms" style={{ textDecoration: 'underline', color: 'inherit' }}>Terms</a>
      </p>
    </div>
  );
}
