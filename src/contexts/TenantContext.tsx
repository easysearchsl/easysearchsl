import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Organization } from "@/types";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

interface TenantContextValue {
  organizations: Organization[];
  currentOrgId: string | null;
  currentOrg: Organization | undefined;
  setCurrentOrgId: (id: string | null) => void;
  availableOrganizations: Organization[]; // based on user memberships/role
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

const LS_TENANT_KEY = "easysearch.tenant.currentOrgId";

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  // Restore selection
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_TENANT_KEY);
      if (raw) setCurrentOrgId(raw);
    } catch {
      // ignore
    }
  }, []);

  // Load organizations for current user (Supabase only). Guests see none here.
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!user) {
          if (mounted) setOrganizations([]);
          return;
        }
        // Superadmin: all organizations
        if (user.role === "superadmin") {
          const { data } = await supabase
            .from("organizations")
            .select("id, name, business_type, contact_email, contact_phone, description, created_at, updated_at");
          if (mounted) setOrganizations((data as any) || []);
          return;
        }
        // Business: organizations where user is a member
        if (user.role === "business") {
          const { data: rows } = await supabase
            .from("organization_members")
            .select("organization:organizations(id, name, business_type, contact_email, contact_phone, description, created_at, updated_at)")
            .eq("user_id", user.id);
          const orgs: Organization[] = ((rows as any[]) || [])
            .map((r) => (r as any).organization)
            .filter(Boolean);
          if (mounted) setOrganizations(orgs);
          return;
        }
        // Registered (non-business): none by default
        if (mounted) setOrganizations([]);
      } catch {
        if (mounted) setOrganizations([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Persist selection
  useEffect(() => {
    try {
      if (currentOrgId) localStorage.setItem(LS_TENANT_KEY, currentOrgId);
    } catch {
      // ignore
    }
  }, [currentOrgId]);

  const currentOrg = useMemo(() => organizations.find((o) => o.id === currentOrgId), [organizations, currentOrgId]);

  const availableOrganizations = useMemo(() => {
    if (user?.role === "superadmin") return organizations;
    const ids = new Set((user?.memberships || []).map((m) => m.organization_id));
    return organizations.filter((o) => ids.has(o.id));
  }, [user, organizations]);

  const value = useMemo(
    () => ({ organizations, currentOrgId, currentOrg, setCurrentOrgId, availableOrganizations }),
    [organizations, currentOrgId, currentOrg, availableOrganizations]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
};
