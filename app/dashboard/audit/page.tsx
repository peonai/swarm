'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, authHeaders } from '../../components/auth-context';
import { Badge } from '../../components/ui';

export default function AuditPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const load = useCallback(async () => {
    const h = authHeaders(token);
    const [al, ph] = await Promise.all([
      fetch('/api/v1/admin/audit?limit=50', { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/v1/admin/history?limit=50', { headers: h }).then(r => r.json()).catch(() => []),
    ]);
    setLogs(Array.isArray(al) ? al : []);
    setHistory(Array.isArray(ph) ? ph : []);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="tab-content">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Audit Log</h1>
        <p className="text-xs" style={{ color: 'var(--text2)' }}>Track all API actions and profile changes</p>
      </div>
      <div className="rounded-xl overflow-hidden mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Action','Agent','Target','Detail','Time'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-medium" style={{ color: 'var(--text2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any, i: number) => (
                <tr key={log.id || i} className="transition-colors hover:bg-[rgba(240,168,48,0.03)]" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-3 py-2"><span className="badge" style={{ background: 'var(--amber-glow)', color: 'var(--amber)' }}>{log.action}</span></td>
                  <td className="px-3 py-2"><Badge text={log.agent_id || ''} /></td>
                  <td className="px-3 py-2 font-mono text-[10px]" style={{ color: 'var(--text2)' }}>{log.target_type}{log.target_id ? `:${log.target_id}` : ''}</td>
                  <td className="px-3 py-2 text-[10px] truncate max-w-[180px]" style={{ color: 'var(--text2)' }}>{log.detail}</td>
                  <td className="px-3 py-2 text-[10px]" style={{ color: 'var(--text2)' }}>{log.created_at && new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && <div className="empty-state py-8"><p className="text-xs">No audit entries yet</p></div>}
      </div>

      <h2 className="text-sm font-semibold mb-3">Profile Change History</h2>
      <div className="space-y-2 stagger-in">
        {history.map((h: any, i: number) => (
          <div key={h.id || i} className="glow-card px-4 py-3" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge" style={{ background: 'var(--amber-glow)', color: 'var(--amber)' }}>{h.layer}</span>
              <span className="font-mono text-xs" style={{ color: 'var(--blue)' }}>{h.key}</span>
              {h.source && <Badge text={h.source} />}
              <span className="ml-auto text-[10px]" style={{ color: 'var(--text2)' }}>{h.created_at && new Date(h.created_at).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
              <div>
                <span style={{ color: 'var(--text2)' }}>Old:</span>
                <pre className="mt-1 p-2 rounded overflow-x-auto font-mono" style={{ background: 'var(--bg)', color: 'rgba(248,113,113,0.7)', fontSize: '0.6rem' }}>{h.old_value || '—'}</pre>
              </div>
              <div>
                <span style={{ color: 'var(--text2)' }}>New:</span>
                <pre className="mt-1 p-2 rounded overflow-x-auto font-mono" style={{ background: 'var(--bg)', color: 'rgba(52,211,153,0.7)', fontSize: '0.6rem' }}>{h.new_value}</pre>
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && <div className="empty-state"><p className="text-xs">No history yet</p></div>}
      </div>
    </div>
  );
}
