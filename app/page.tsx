'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    fetch('/api/v1/setup').then(r => r.json()).then(d => {
      router.replace(d.initialized ? '/login' : '/setup');
    }).catch(() => router.replace('/login'));
  }, [router]);
  return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text2)' }}>Loading...</div>;
}
