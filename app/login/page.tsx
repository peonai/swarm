'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../components/auth-context';

function LoginForm() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.replace('/dashboard'); }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      login(data.token, data.user);
      router.push('/dashboard');
    } catch { setError('Connection failed'); }
    finally { setLoading(false); }
  };

  const inputStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="hex-bg" />
      <div className="glow-card p-8 w-full max-w-sm relative z-10" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-6 justify-center">
          <svg className="logo-hex" width="32" height="32" viewBox="0 0 100 100" fill="none">
            <path d="M50 5L93.3 27.5V72.5L50 95L6.7 72.5V27.5L50 5Z" stroke="var(--amber)" strokeWidth="4" fill="none"/>
            <circle cx="50" cy="50" r="6" fill="var(--amber)" opacity="0.8"/>
          </svg>
          <div className="text-xl font-bold">Swarm AI</div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm" style={inputStyle} autoFocus />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm" style={inputStyle} />
          {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-amber w-full py-2.5 text-sm">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
      <p className="relative z-10 mt-6 text-[10px]" style={{ color: 'var(--text2)' }}>
        © 2026 PeonAI · <a href="mailto:peon@peonai.net" style={{ textDecoration: 'underline', color: 'inherit' }}>peon@peonai.net</a> · <a href="/privacy" style={{ textDecoration: 'underline', color: 'inherit' }}>Privacy</a> · <a href="/terms" style={{ textDecoration: 'underline', color: 'inherit' }}>Terms</a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return <AuthProvider><LoginForm /></AuthProvider>;
}
