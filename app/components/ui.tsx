'use client';
import { useRef } from 'react';

const PALETTE = ['#f0a830','#60a5fa','#34d399','#f87171','#a78bfa','#fb923c','#38bdf8','#4ade80'];
const AC: Record<string, string> = {};
export function agentColor(id: string) {
  if (!id) return '#9898a8';
  return AC[id] ??= PALETTE[Object.keys(AC).length % PALETTE.length];
}

export function Badge({ text, color }: { text: string; color?: string }) {
  const c = color || agentColor(text);
  return (
    <span className="badge" style={{ background: `${c}18`, color: c, border: `1px solid ${c}30` }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
      </svg>
      {text}
    </span>
  );
}

export function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
}

export function Stat({ label, value, icon, onClick }: { label: string; value: string | number; icon: string; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      ref.current!.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      ref.current!.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    }
  };
  return (
    <button ref={ref} onClick={onClick} onMouseMove={handleMove} className="stat-card text-left w-full">
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text2)' }}>{label}</span>
        <span style={{ color: 'var(--amber)', opacity: 0.6 }}><Icon d={icon} size={16} /></span>
      </div>
      <div className="stat-value relative z-10">{value}</div>
    </button>
  );
}
