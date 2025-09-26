import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type EffectiveRole = 'public' | 'business' | 'guest' | 'superadmin';

function supabaseEnvAvailable() {
  const env: any = (import.meta as any)?.env || {};
  return !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_ANON_KEY;
}

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<EffectiveRole>('public');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const computeRole = async () => {
      setLoading(true);

      // Prefer Supabase auth + RLS if configured. When configured, ignore local mock user.
      if (supabaseEnvAvailable()) {
        try {
          const mod = await import('@/lib/supabase');
          const supabase = (mod as any).supabase as import('@supabase/supabase-js').SupabaseClient;

          const { data: sessionRes } = await supabase.auth.getSession();
          const session = sessionRes?.session;

          if (session) {
            // Check app_admins first: if present, treat as superadmin
            try {
              const { data: adminRows, error: adminError } = await supabase
                .from('app_admins')
                .select('user_id')
                .eq('user_id', session.user.id)
                .limit(1);

              if (!adminError && adminRows && adminRows.length > 0) {
                setRole('superadmin');
                setLoading(false);
                return;
              }
            } catch {
              // ignore admin check errors and continue
            }

            // If user can see any of their organization_members rows under RLS, treat as business user
            const { data, error } = await supabase
              .from('organization_members')
              .select('id')
              .limit(1);

            if (!error && data && data.length > 0) {
              setRole('business');
              setLoading(false);
              return;
            }

            // Authenticated but no membership rows visible
            setRole('guest');
            setLoading(false);
            return;
          }
          // If Supabase is configured but no session, treat as public regardless of local user
          setRole('public');
          setLoading(false);
          return;
        } catch {
          // ignore and fall back (e.g., dynamic import issues)
        }
      }

      // Supabase not configured: allow local mock user fallback for dev mode
      if (user) {
        if (user.role === 'superadmin') {
          setRole('superadmin');
        } else if (user.role === 'registered') {
          setRole('guest');
        } else if (user.role === 'business' || (user.memberships && user.memberships.length > 0)) {
          setRole('business');
        } else {
          setRole('guest');
        }
      } else {
        // No auth user and no Supabase session
        setRole('public');
      }
      setLoading(false);
    };

    computeRole();

    // Subscribe to Supabase auth changes if available
    (async () => {
      if (supabaseEnvAvailable()) {
        try {
          const mod = await import('@/lib/supabase');
          const supabase = (mod as any).supabase as import('@supabase/supabase-js').SupabaseClient;
          const { data } = supabase.auth.onAuthStateChange(() => computeRole());
          unsub = () => data.subscription.unsubscribe();
        } catch {
          // ignore
        }
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  return { role, loading } as const;
}

