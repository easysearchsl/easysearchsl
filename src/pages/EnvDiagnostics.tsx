import React from "react";

const safeCheck = <T,>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

function isLikelySupabaseUrl(u: string | undefined): boolean {
  if (!u) return false;
  try {
    const url = new URL(u);
    // typical format: https://<ref>.supabase.co
    return url.protocol === "https:" && /\.supabase\.co$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function isLikelyAnonKey(k: string | undefined): boolean {
  if (!k) return false;
  // Basic JWT shape check (header.payload.signature)
  return k.split(".").length === 3 && k.length > 50;
}

function isUuid(v: string | undefined): boolean {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

const EnvDiagnostics: React.FC = () => {
  const url = safeCheck(() => import.meta.env.VITE_SUPABASE_URL as string | undefined, undefined);
  const anon = safeCheck(() => import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined, undefined);
  const support = safeCheck(() => import.meta.env.VITE_SUPPORT_USER_ID as string | undefined, undefined);

  const checks = [
    {
      key: "VITE_SUPABASE_URL",
      present: Boolean(url),
      valid: isLikelySupabaseUrl(url),
      hint: "Expect an https:// URL ending with supabase.co",
    },
    {
      key: "VITE_SUPABASE_ANON_KEY",
      present: Boolean(anon),
      valid: isLikelyAnonKey(anon),
      hint: "Should look like a JWT (three dot-separated parts)",
    },
    {
      key: "VITE_SUPPORT_USER_ID",
      present: Boolean(support),
      valid: isUuid(support),
      hint: "Should be a UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)",
    },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Environment Diagnostics</h1>
      <p style={{ marginBottom: 16 }}>
        This page checks whether required environment variables are present and appear valid. No secret values are displayed.
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        {checks.map((c) => (
          <div key={c.key} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{c.key}</strong>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 999,
                  fontSize: 12,
                  background: c.present ? (c.valid ? "#DCFCE7" : "#FEF9C3") : "#FEE2E2",
                  color: c.present ? (c.valid ? "#166534" : "#92400E") : "#991B1B",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {c.present ? (c.valid ? "Present ✓ Valid" : "Present × Needs attention") : "Missing"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>{c.hint}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, fontSize: 12, color: "#6B7280" }}>
        Tip: Vite reads .env files at startup. If you just changed values, restart the dev server.
      </div>
    </div>
  );
};

export default EnvDiagnostics;
