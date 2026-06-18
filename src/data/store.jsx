import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  SEED_SCHOOLS, SEED_APP_CONFIG, SEED_BROADCASTS,
  SEED_ACTIVITY, SEED_OWNERS,
} from './seed.js';

const KEY = 'pf_admin_store_v1';
const DataContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    schools: SEED_SCHOOLS,
    appConfig: SEED_APP_CONFIG,
    broadcasts: SEED_BROADCASTS,
    activity: SEED_ACTIVITY,
    owners: SEED_OWNERS,
  };
}

const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export function DataProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const log = useCallback((action, target, type = 'config') => {
    setState((s) => ({
      ...s,
      activity: [
        { id: uid('l'), at: new Date().toISOString(), actor: 'Owner', action, target, type },
        ...s.activity,
      ].slice(0, 200),
    }));
  }, []);

  // ---- Schools ----
  const getSchool = useCallback((id) => state.schools.find((x) => x.id === id), [state.schools]);

  const addSchool = useCallback((data) => {
    const id = uid('sch');
    const school = {
      id,
      code: (data.code || data.name.slice(0, 4)).toUpperCase(),
      status: 'trial',
      plan: data.plan || 'starter',
      bannerColor: 'linear-gradient(135deg, #0C1B33, #2563EB)',
      onboardedAt: new Date().toISOString().slice(0, 10),
      modules: { ...state.appConfig.defaultModules },
      authorities: [], teachers: [], students: [],
      classes: [],
      principal: { name: data.principalName || '', email: '', phone: '' },
      vicePrincipal: { name: '', email: '', phone: '' },
      counts: { students: 0, teachers: 0, parents: 0, classes: 0 },
      attendanceRate: 0,
      ...data,
    };
    setState((s) => ({ ...s, schools: [school, ...s.schools] }));
    log('Onboarded', `${school.name} (${school.status})`, 'school');
    return id;
  }, [state.appConfig.defaultModules, log]);

  const updateSchool = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      schools: s.schools.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);

  const setSchoolStatus = useCallback((id, status) => {
    updateSchool(id, { status });
    const sc = state.schools.find((x) => x.id === id);
    log(status === 'active' ? 'Activated' : status === 'suspended' ? 'Suspended' : 'Updated', sc?.name || id, 'status');
  }, [state.schools, updateSchool, log]);

  const deleteSchool = useCallback((id) => {
    const sc = state.schools.find((x) => x.id === id);
    setState((s) => ({ ...s, schools: s.schools.filter((x) => x.id !== id) }));
    log('Removed', sc?.name || id, 'school');
  }, [state.schools, log]);

  const toggleModule = useCallback((schoolId, moduleKey) => {
    setState((s) => ({
      ...s,
      schools: s.schools.map((x) =>
        x.id === schoolId ? { ...x, modules: { ...x.modules, [moduleKey]: !x.modules[moduleKey] } } : x
      ),
    }));
  }, []);

  // ---- Nested collections (authorities / teachers / students) ----
  const addToCollection = useCallback((schoolId, collection, items) => {
    const list = Array.isArray(items) ? items : [items];
    setState((s) => ({
      ...s,
      schools: s.schools.map((x) => {
        if (x.id !== schoolId) return x;
        const withIds = list.map((it) => ({ id: uid(collection.slice(0, 2)), ...it }));
        const next = [...(x[collection] || []), ...withIds];
        const counts = { ...x.counts };
        if (collection === 'students') counts.students = next.length > x.counts.students ? next.length : x.counts.students + withIds.length;
        if (collection === 'teachers') counts.teachers = next.length;
        return { ...x, [collection]: next, counts };
      }),
    }));
  }, []);

  const updateInCollection = useCallback((schoolId, collection, itemId, patch) => {
    setState((s) => ({
      ...s,
      schools: s.schools.map((x) =>
        x.id === schoolId
          ? { ...x, [collection]: x[collection].map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : x
      ),
    }));
  }, []);

  const removeFromCollection = useCallback((schoolId, collection, itemId) => {
    setState((s) => ({
      ...s,
      schools: s.schools.map((x) =>
        x.id === schoolId
          ? { ...x, [collection]: x[collection].filter((it) => it.id !== itemId) }
          : x
      ),
    }));
  }, []);

  // ---- App config (platform-wide) ----
  const updateAppConfig = useCallback((patch) => {
    setState((s) => ({ ...s, appConfig: { ...s.appConfig, ...patch } }));
  }, []);

  // ---- Broadcasts ----
  const sendBroadcast = useCallback((b) => {
    const item = { id: uid('b'), sentAt: new Date().toISOString(), sentBy: 'Owner', reach: b.reach || 0, ...b };
    setState((s) => ({ ...s, broadcasts: [item, ...s.broadcasts] }));
    log('Broadcast', `${b.title} → ${b.audience}`, 'broadcast');
  }, [log]);

  // ---- Owners / team ----
  const addOwner = useCallback((o) => {
    setState((s) => ({ ...s, owners: [{ id: uid('o'), status: 'active', lastActive: new Date().toISOString(), ...o }, ...s.owners] }));
    log('Invited team member', o.email, 'config');
  }, [log]);
  const removeOwner = useCallback((id) => {
    setState((s) => ({ ...s, owners: s.owners.filter((o) => o.id !== id) }));
  }, []);

  const resetData = useCallback(() => {
    localStorage.removeItem(KEY);
    setState(load());
  }, []);

  const value = {
    ...state,
    getSchool, addSchool, updateSchool, setSchoolStatus, deleteSchool, toggleModule,
    addToCollection, updateInCollection, removeFromCollection,
    updateAppConfig, sendBroadcast, addOwner, removeOwner, log, resetData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
