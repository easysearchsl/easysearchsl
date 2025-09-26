import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Organization } from "@/types";
import { supabase } from "@/lib/supabase";

export type AuthRole = "guest" | "registered" | "business" | "superadmin";

export type MembershipRole = "owner" | "editor" | "viewer";

export interface AuthMembership {
  organization_id: string;
  role: MembershipRole;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: AuthRole;
  memberships?: AuthMembership[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginWithEmailPassword: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (full_name: string, email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LS_USER_KEY = "easysearch.auth.user";
const SS_USER_KEY = "easysearch.auth.user"; // same key, different storage
const SB_PERSIST_KEY = "easysearch.auth.persist"; // used by supabase smart storage

function supabaseEnvAvailable() {
  const env: any = (import.meta as any)?.env || {};
  return !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_ANON_KEY;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persist, setPersist] = useState<"local" | "session">(() => {
    try {
      const hasLocal = !!localStorage.getItem(LS_USER_KEY);
      const hasSession = !!sessionStorage.getItem(SS_USER_KEY);
      if (hasLocal) return "local";
      if (hasSession) return "session";
    } catch {}
    return "local";
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    // If Supabase is configured, defer to Supabase session only (ignore local mock)
    if (supabaseEnvAvailable()) return null;
    // Hydrate from the selected storage first, then fallback (dev/local mode)
    try {
      const fromLocal = localStorage.getItem(LS_USER_KEY);
      const fromSession = sessionStorage.getItem(SS_USER_KEY);
      const raw = fromLocal || fromSession;
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  // Persist session
  useEffect(() => {
    try {
      if (user) {
        if (persist === "local") {
          localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
          sessionStorage.removeItem(SS_USER_KEY);
        } else {
          sessionStorage.setItem(SS_USER_KEY, JSON.stringify(user));
          localStorage.removeItem(LS_USER_KEY);
        }
      } else {
        localStorage.removeItem(LS_USER_KEY);
        sessionStorage.removeItem(SS_USER_KEY);
      }
    } catch {
      // ignore
    }
  }, [user, persist]);

  const isAuthenticated = !!user;

  async function computeRoleForUser(userId: string): Promise<AuthRole> {
    // Default role
    let role: AuthRole = "registered";
    if (!supabaseEnvAvailable()) return role;
    // Explicit mapping for known seeded users
    try {
      const SUPER_ADMIN_ID = "33333333-3333-3333-3333-333333333333";
      const BUSINESS_OWNER_ID = "11111111-1111-1111-1111-111111111111";
      // const REGISTERED_USER_ID = "22222222-2222-2222-2222-222222222222"; // falls back to registered
      if (userId === SUPER_ADMIN_ID) return "superadmin";
      if (userId === BUSINESS_OWNER_ID) role = "business";
    } catch {}
    try {
      // 0) profiles role overrides if present
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (!profileErr && profile?.role) {
        const r = String(profile.role).toLowerCase();
        if (r === "superadmin") return "superadmin";
        if (r === "business") return "business";
        return "registered";
      }
    } catch {}
    try {
      // Check superadmin in app_admins
      const { data: adminRows, error: adminErr } = await supabase
        .from("app_admins")
        .select("user_id")
        .eq("user_id", userId)
        .limit(1);
      if (!adminErr && adminRows && adminRows.length > 0) {
        return "superadmin";
      }
    } catch {}
    try {
      // Check membership existence
      const { data, error } = await supabase
        .from("organization_members")
        .select("id")
        .limit(1);
      if (!error && data && data.length > 0) {
        role = "business";
      }
    } catch {}
    return role;
  }

  async function supabaseUserToAuthUser(): Promise<AuthUser | null> {
    if (!supabaseEnvAvailable()) return null;
    try {
      const { data: sessionRes } = await supabase.auth.getSession();
      const session = sessionRes?.session;
      const sUser = session?.user;
      if (!sUser) return null;
      const role = await computeRoleForUser(sUser.id);
      const full_name = (sUser.user_metadata?.full_name as string) || (sUser.user_metadata?.name as string) || sUser.email || "User";
      const avatar_url = (sUser.user_metadata?.avatar_url as string) || undefined;
      // Fetch memberships (only those visible under RLS)
      let memberships: AuthMembership[] = [];
      try {
        const { data: rows } = await supabase
          .from("organization_members")
          .select("organization_id, role")
          .eq("user_id", sUser.id);
        memberships = (rows || []).map((r: any) => ({ organization_id: r.organization_id, role: r.role as MembershipRole }));
      } catch {}

      const authUser: AuthUser = {
        id: sUser.id,
        email: sUser.email || "",
        full_name,
        avatar_url,
        role,
        memberships,
      };
      return authUser;
    } catch {
      return null;
    }
  }

  const loginWithEmailPassword = async (email: string, password: string, remember: boolean = true) => {
    if (!supabaseEnvAvailable()) {
      throw new Error("Authentication is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    }
    // Set Supabase persistence mode for smart storage
    try {
      localStorage.setItem(SB_PERSIST_KEY, remember ? "local" : "session");
    } catch {}
    setPersist(remember ? "local" : "session");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message || "Invalid credentials");
    }
    const authUser = await supabaseUserToAuthUser();
    if (!authUser) {
      throw new Error("Unable to load session after sign-in");
    }
    setUser(authUser);
  };

  const register = async (full_name: string, email: string) => {
    if (supabaseEnvAvailable()) {
      // Send magic link (OTP) to email; do not set local user
      const redirectTo = `${window.location.origin}/login`;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) throw new Error(error.message || "Failed to start sign-up. Try again.");
      return;
    } else {
      // Local mock fallback (dev-only)
      const newUser: AuthUser = {
        id: (crypto?.randomUUID && crypto.randomUUID()) || `user-${Date.now()}`,
        email,
        full_name,
        role: "registered",
        memberships: [],
      };
      setUser(newUser);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(LS_USER_KEY);
      sessionStorage.removeItem(SS_USER_KEY);
      if (supabaseEnvAvailable()) {
        supabase.auth.signOut();
        // Clear supabase persistence indicator
        localStorage.removeItem(SB_PERSIST_KEY);
      }
    } catch {}
  };

  // Hydrate from Supabase session on load and subscribe to auth changes
  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      if (!supabaseEnvAvailable()) return;
      const authUser = await supabaseUserToAuthUser();
      if (authUser) setUser(authUser);
      const { data } = supabase.auth.onAuthStateChange(async () => {
        const u = await supabaseUserToAuthUser();
        setUser(u);
      });
      unsub = () => data.subscription.unsubscribe();
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, loginWithEmailPassword, register, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
