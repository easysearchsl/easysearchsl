import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function supabaseEnvAvailable() {
  const env: any = (import.meta as any)?.env || {};
  return !!env.VITE_SUPABASE_URL && !!env.VITE_SUPABASE_ANON_KEY;
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (supabaseEnvAvailable()) {
        const mod = await import("@/lib/supabase");
        const supabase = (mod as any).supabase as import("@supabase/supabase-js").SupabaseClient;
        const redirectTo = `${window.location.origin}/login`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        setMessage("If an account exists for that email, a reset link has been sent. Please check your inbox.");
      } else {
        // Demo mode (no Supabase). Simulate success.
        setMessage("This demo shows the reset flow UI. Configure Supabase to enable email resets.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to request password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgotten password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {message && <div className="text-sm text-green-600">{message}</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
          <div className="mt-6 text-sm">
            Remembered it? <Link to="/login" className="text-primary underline">Back to login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
