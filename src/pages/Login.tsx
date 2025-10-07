import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const { loginWithEmailPassword, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmailPassword(email, password, remember);
      navigate(next, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Sign-in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setOauthLoading(true);
    setOauthError(null);
    try {
      await loginWithGoogle(next);
      // Redirect will occur via Supabase OAuth flow
    } catch (err: any) {
      setOauthError(err?.message || "Google sign-in failed.");
    } finally {
      setOauthLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex items-center justify-between">
              <label htmlFor="remember" className="flex items-center gap-2 text-sm select-none">
                <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
                <span>Keep me signed in</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgotten password?</Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          {oauthError && <div className="text-sm text-red-600 mb-2">{oauthError}</div>}
          <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={oauthLoading}>
            {oauthLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="mt-6 text-sm">
            New here? <Link to={`/register?next=${encodeURIComponent(next)}`} className="text-primary underline">Create an account</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
