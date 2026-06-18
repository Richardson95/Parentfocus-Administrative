import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const KEY = 'pf_admin_auth';

// Demo owner credentials. Replace with a real backend auth call.
const OWNER = {
  email: 'adetunjidammie2@gmail.com',
  password: 'parentfocus',
  name: 'Dammie Adetunji',
  role: 'Super Admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  });

  const login = (email, password) => {
    const ok =
      email.trim().toLowerCase() === OWNER.email &&
      password === OWNER.password;
    // Demo convenience: also accept any *@parentfocus.ng with password "parentfocus".
    const altOk = email.trim().toLowerCase().endsWith('@parentfocus.ng') && password === 'parentfocus';
    if (ok || altOk) {
      const u = { email: email.trim().toLowerCase(), name: ok ? OWNER.name : 'Platform Admin', role: OWNER.role };
      localStorage.setItem(KEY, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid email or password.' };
  };

  const logout = () => { localStorage.removeItem(KEY); setUser(null); };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export const DEMO_CREDS = { email: OWNER.email, password: OWNER.password };
