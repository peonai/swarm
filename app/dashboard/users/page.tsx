'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, authHeaders } from '../../components/auth-context';

export default function UsersPage() {
  const { token, user: me } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'user' });

  const load = useCallback(async () => {
    const u = await fetch('/api/v1/admin/users', { headers: authHeaders(token) }).then(r => r.json()).catch(() => []);
    setUsers(Array.isArray(u) ? u : []);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.username || !form.password) return;
    const res = await fetch('/api/v1/admin/users', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(form) });
    if (res.ok) { setForm({ username: '', password: '', name: '', role: 'user' }); load(); }
    else { const e = await res.json(); alert(e.error); }
  };
  const action = async (id: string, act: string) => {
    if (act === 'delete') { if (id === me?.id || !confirm(`Delete "${id}"?`)) return; await fetch('/api/v1/admin/users', { method: 'DELETE', headers: authHeaders(token), body: JSON.stringify({ id }) }); }
    else if (act === 'reset_password') {
      const password = prompt(`Enter new password for "${id}" (min 6 chars):`);
      if (!password || password.length < 6) return alert('Password must be at least 6 characters');
      await fetch('/api/v1/admin/users', { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ id, action: act, password }) });
    }
    else { await fetch('/api/v1/admin/users', { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ id, action: act }) }); }
    load();
  };

  const inputStyle = { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' };
  const smallBtn = (bg: string, color: string) => ({ background: bg, color, fontSize: '10px', padding: '2px 8px', borderRadius: '6px' });

  return (
    <div className="tab-content">
      <div className="mb-6">
        <h1 className="text-xl font-bold">User Management</h1>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>Create and manage user accounts</p>
      </div>
      <div className="glow-card p-4 mb-6" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          <input placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="rounded-lg px-3 py-2 text-xs" style={inputStyle} />
          <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="rounded-lg px-3 py-2 text-xs" style={inputStyle} />
          <input placeholder="Display Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="rounded-lg px-3 py-2 text-xs" style={inputStyle} />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="rounded-lg px-3 py-2 text-xs" style={inputStyle}>
            <option value="user">User</option><option value="admin">Admin</option>
          </select>
        </div>
        <button onClick={add} className="btn-amber px-4 py-2 text-xs">+ Create User</button>
      </div>
      <div className="space-y-2 stagger-in">
        {users.map((u: any) => (
          <div key={u.id} className="glow-card px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ border: '1px solid var(--border)', opacity: u.disabled ? 0.5 : 1 }}>
            <div>
              <div className="font-semibold text-xs">{u.name || u.id} {u.id === me?.id && <span style={{ color: 'var(--amber)' }}>(you)</span>} {u.disabled ? <span style={{ color: 'var(--red)' }}>(disabled)</span> : null}</div>
              <div className="font-mono text-[10px]" style={{ color: 'var(--text2)' }}>{u.id}</div>
              {u.api_token && <div className="font-mono text-[10px] truncate max-w-[240px]" style={{ color: 'var(--text2)' }}>Token: {u.api_token}</div>}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="badge" style={{ background: u.role === 'admin' ? 'var(--amber-glow)' : 'rgba(52,211,153,0.1)', color: u.role === 'admin' ? 'var(--amber)' : 'var(--green)' }}>{u.role}</span>
              {u.id !== me?.id && <>
                <button onClick={() => action(u.id, u.disabled ? 'enable' : 'disable')} style={smallBtn(u.disabled ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', u.disabled ? 'var(--green)' : 'var(--red)')}>
                  {u.disabled ? 'Enable' : 'Disable'}</button>
                <button onClick={() => action(u.id, 'reset_password')} style={smallBtn('rgba(168,85,247,0.1)', '#a855f7')}>Reset Pwd</button>
                <button onClick={() => action(u.id, 'reset_token')} style={smallBtn('rgba(96,165,250,0.1)', 'var(--blue)')}>Reset Token</button>
                <button onClick={() => action(u.id, 'delete')} style={smallBtn('rgba(248,113,113,0.1)', 'var(--red)')}>Delete</button>
              </>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
