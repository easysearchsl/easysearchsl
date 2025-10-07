import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Dev-only diagnostics (won't run in production build). Avoid logging full keys.
if (import.meta.env?.DEV) {
  try {
    const masked = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 8
      ? `${supabaseAnonKey.slice(0, 6)}…${supabaseAnonKey.slice(-4)}`
      : supabaseAnonKey ? 'set' : 'missing';
    console.log('[Supabase] VITE_SUPABASE_URL =', supabaseUrl || '(missing)');
    console.log('[Supabase] VITE_SUPABASE_ANON_KEY =', masked);
  } catch {/* noop */}
}

const PERSIST_KEY = 'easysearch.auth.persist';
type PersistMode = 'local' | 'session';

function getPersistMode(): PersistMode {
  try {
    const v = localStorage.getItem(PERSIST_KEY);
    return v === 'session' ? 'session' : 'local';
  } catch {
    return 'local';
  }
}

// Storage adapter that switches between localStorage and sessionStorage at runtime
const smartStorage = {
  getItem: (key: string) => {
    try {
      const mode = getPersistMode();
      const s = mode === 'session' ? sessionStorage : localStorage;
      return s.getItem(key);
    } catch {
      return null as any;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      const mode = getPersistMode();
      const s = mode === 'session' ? sessionStorage : localStorage;
      s.setItem(key, value);
      // Ensure it exists only in the active storage
      const other = mode === 'session' ? localStorage : sessionStorage;
      other.removeItem(key);
    } catch {
      // ignore
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

function makeDisabledClient() {
  const builder = () => {
    const self: any = {
      select: () => self,
      eq: () => self,
      ilike: () => self,
      or: () => self,
      order: () => self,
      limit: () => self,
      gt: () => self,
      range: async () => ({ data: null, error: new Error('Supabase not configured'), count: 0 }),
    };
    return self;
  };
  return {
    from: (_: string) => builder(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: new Error('Supabase not configured') }),
      resetPasswordForEmail: async () => ({ data: {}, error: new Error('Supabase not configured') }),
    },
  } as any;
}

export const supabase: any = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: smartStorage as any,
      },
    })
  : makeDisabledClient();
