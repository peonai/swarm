'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = { id: string; name: string; role: string; api_token?: string } | null;
type AuthCtx = { user: User; token: string | null; login: (token: string, user: User) => void; logout: () => void; loading: boolean };

const Ctx = createContext<AuthCtx>({ user: null, token: null, login: () => {}, logout: () => {}, loading: true });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('swarm_token');
    const u = localStorage.getItem('swarm_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  const login = (t: string, u: User) => {
    localStorage.setItem('swarm_token', t);
    localStorage.setItem('swarm_user', JSON.stringify(u));
    setToken(t); setUser(u);
  };
  const logout = () => {
    localStorage.removeItem('swarm_token');
    localStorage.removeItem('swarm_user');
    setToken(null); setUser(null);
  };

  return <Ctx.Provider value={{ user, token, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function authHeaders(token: string | null): Record<string, string> {
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
