'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../components/auth-context';
import Sidebar from '../components/sidebar';

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text2)' }}>Loading...</div>;
  if (!user) return null;

  return (
    <>
      <div className="hex-bg" />
      <div className="flex min-h-screen relative z-10">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto md:ml-0 ml-0 pt-14 md:pt-6">{children}</main>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><Guard>{children}</Guard></AuthProvider>;
}
