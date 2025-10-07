import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  function passwordScore(pw: string) {
    let score = 0;
    const hasLen = pw.length >= 8;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSpecial = /[^\w\s]/.test(pw);
    const long = pw.length >= 12;
    score += hasLen ? 1 : 0;
    score += hasLower ? 1 : 0;
    score += hasUpper ? 1 : 0;
    score += hasDigit ? 1 : 0;
    score += hasSpecial ? 1 : 0;
    if (long) score += 1;
    // Normalize to 0..4 for display
    const capped = Math.min(4, score);
    const percent = (capped / 4) * 100;
    let label: "Weak" | "Medium" | "Strong";
    if (capped <= 1) label = "Weak";
    else if (capped <= 2) label = "Medium";
    else label = "Strong";
    return { percent, label };
  }

  const { percent, label } = passwordScore(password);
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirm && confirm.length > 0;
  const formValid = fullName && email && passwordValid && passwordsMatch;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (!passwordValid) throw new Error("Password must be at least 8 characters.");
      if (!passwordsMatch) throw new Error("Passwords do not match.");
      const res = await register(fullName, email, password);
      if (res.emailConfirmationRequired) {
        setMessage("Account created. Please check your email to confirm your address before signing in.");
      } else {
        navigate(next, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setOauthLoading(true);
    setOauthError(null);
    try {
      await loginWithGoogle(next);
      // Redirect handled by Supabase
    } catch (err: any) {
      setOauthError(err?.message || "Google sign-up failed.");
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-1">
                <Progress value={percent} />
                <div className="text-xs text-muted-foreground">
                  Strength: {label}
                </div>
              </div>
            </div>
            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!passwordsMatch && confirm.length > 0 && (
                <div className="text-xs text-red-600">Passwords do not match.</div>
              )}
              {!passwordValid && password.length > 0 && (
                <div className="text-xs text-red-600">Password must be at least 8 characters.</div>
              )}
            </div>
            {message && <div className="text-sm text-green-600">{message}</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading || !formValid}>
              {loading ? "Creating..." : "Create account"}
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
            Already have an account? {" "}
            <Link to={`/login?next=${encodeURIComponent(next)}`} className="text-primary underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
