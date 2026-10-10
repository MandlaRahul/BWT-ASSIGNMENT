import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/auth/me').then(d => setUser(d.user)).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);

  const save = d => { localStorage.setItem('token', d.token); setUser(d.user); return d.user; };
  const value = {
    user, ready,
    login: async (email, password) => save(await api('/auth/login', { method: 'POST', body: { email, password } })),
    register: async (name, email, password) => save(await api('/auth/register', { method: 'POST', body: { name, email, password } })),
    updateProfile: async body => { const d = await api('/auth/me', { method: 'PUT', body }); setUser(d.user); return d.user; },
    logout: () => { localStorage.removeItem('token'); setUser(null); }
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
