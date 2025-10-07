import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

function supabaseEnvAvailable() {
  const env: any = (import.meta as any)?.env || {};
  return !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_ANON_KEY;
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      if (!supabaseEnvAvailable()) {
        setTokenReady(false);
        return;
      }
      const mod = await import("@/lib/supabase");
      const supabase = (mod as any).supabase as import("@supabase/supabase-js").SupabaseClient;

      // If session already exists (after redirect), allow reset
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) setTokenReady(true);
      } catch {}

      // Additionally, watch for PASSWORD_RECOVERY event
      try {
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || (session && session.user)) {
            setTokenReady(true);
          }
        });
        unsub = () => data.subscription.unsubscribe();
      } catch {}
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (!supabaseEnvAvailable()) {
        setError("Password reset is not configured. Please contact support.");
        return;
      }
      if (!tokenReady) {
        setError("This reset link is invalid or expired. Please request a new password reset.");
        return;
      }
      if (!password || password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      const mod = await import("@/lib/supabase");
      const supabase = (mod as any).supabase as import("@supabase/supabase-js").SupabaseClient;
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Your password has been updated. You can now sign in.");
      // Redirect to login after a short delay
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>
        <CardContent>
          {!supabaseEnvAvailable() && (
            <div className="text-sm text-yellow-700 mb-4">
              Email password resets are not configured. Add Supabase env keys to enable.
            </div>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            {message && <div className="text-sm text-green-600">{message}</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading || !supabaseEnvAvailable()}>
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
          <div className="mt-6 text-sm">
            Back to <Link to="/login" className="text-primary underline">login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
