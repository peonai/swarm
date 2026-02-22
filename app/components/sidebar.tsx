'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './ui';
import { useAuth } from './auth-context';
import { locales, type Locale } from '../i18n';

const NAV = [
  { path: '/dashboard', id: 'overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { path: '/dashboard/profile', id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { path: '/dashboard/agents', id: 'agents', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
  { path: '/dashboard/memory', id: 'memory', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { path: '/dashboard/audit', id: 'audit', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/dashboard/users', id: 'users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3-2.803a4 4 0 11-8 0 4 4 0 018 0z' },
  { path: '/dashboard/settings', id: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [lang, setLang] = useState<Locale>('en');
  const [open, setOpen] = useState(false);
  const t = locales[lang];

  const isActive = (path: string) => path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path);

  const navItems = NAV.filter(n => n.id !== 'users' || user?.role === 'admin');

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setOpen(!open)} className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Icon d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} size={20} />
      </button>

      {/* Overlay */}
      {open && <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setOpen(false)} />}

      <aside className={`sidebar w-52 flex-shrink-0 flex flex-col fixed md:static inset-y-0 left-0 z-40 transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center gap-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
          <svg className="logo-hex" width="26" height="26" viewBox="0 0 100 100" fill="none">
            <path d="M50 5L93.3 27.5V72.5L50 95L6.7 72.5V27.5L50 5Z" stroke="var(--amber)" strokeWidth="4" fill="none"/>
            <path d="M50 25L72.5 37.5V62.5L50 75L27.5 62.5V37.5L50 25Z" stroke="var(--amber)" strokeWidth="3" fill="none" opacity="0.5"/>
            <circle cx="50" cy="50" r="6" fill="var(--amber)" opacity="0.8"/>
          </svg>
          <div>
            <div className="font-semibold text-xs tracking-wide">{t.brand}</div>
            <div className="text-[10px]" style={{ color: 'var(--text2)' }}>{t.dashboard}</div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(n => (
            <button key={n.id} onClick={() => { router.push(n.path); setOpen(false); }}
              className={`sidebar-link w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${isActive(n.path) ? 'active' : ''}`}
              style={{ background: isActive(n.path) ? 'var(--amber-glow)' : 'transparent', color: isActive(n.path) ? 'var(--amber)' : 'var(--text2)' }}>
              <Icon d={n.icon} size={16} />
              {t.nav[n.id as keyof typeof t.nav] || n.id}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t text-[10px] space-y-2" style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
          {user && <div className="truncate">{user.name} ({user.role})</div>}
          <div className="flex gap-1.5">
            <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="px-1.5 py-0.5 rounded"
              style={{ border: '1px solid var(--border)' }}>{lang === 'en' ? '中' : 'EN'}</button>
            <button onClick={() => { logout(); router.push('/login'); }} className="px-1.5 py-0.5 rounded"
              style={{ border: '1px solid var(--border)', color: 'var(--red)' }}>退出</button>
          </div>
        </div>
      </aside>
    </>
  );
}
