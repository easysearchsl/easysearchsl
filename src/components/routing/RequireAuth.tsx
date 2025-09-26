import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthRole } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: AuthRole[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles = ["registered", "business", "superadmin"] }) => {
  const { user } = useAuth();
  const { role: effectiveRole, loading } = useRole();
  const location = useLocation();

  // Wait for role resolution to avoid flicker/incorrect redirects
  if (loading) {
    return null;
  }

  // Treat "public" effective role as unauthenticated (Supabase or local)
  if (effectiveRole === "public") {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // Superadmin has full access to any protected route
  if (effectiveRole === "superadmin") {
    return <>{children}</>;
  }

  // Superadmin-only guard (when explicitly required)
  const superadminOnly =
    allowedRoles.includes("superadmin") &&
    !allowedRoles.includes("business") &&
    !allowedRoles.includes("registered") &&
    !allowedRoles.includes("guest");
  if (superadminOnly) {
    if (user?.role !== "superadmin") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // Map allowed AuthRole[] to effective roles
  const allowsRegistered = allowedRoles.includes("registered") || allowedRoles.includes("guest");
  const allowsBusiness = allowedRoles.includes("business") || allowedRoles.includes("superadmin");

  const canAccess =
    (effectiveRole === "business" && (allowsBusiness || allowsRegistered)) ||
    (effectiveRole === "guest" && allowsRegistered);

  if (!canAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
