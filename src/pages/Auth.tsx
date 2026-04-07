import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Loader2, Eye, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DEMO_EMAIL = "demo@shadowmd.com";
const DEMO_PASSWORD = "Demo@123";

const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </Button>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoStatus, setDemoStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email to verify your account before signing in." });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast({ title: "Authentication Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const attemptDemoLogin = async (): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    return !error;
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setDemoStatus("Logging in...");
    try {
      // First attempt
      if (await attemptDemoLogin()) {
        setDemoStatus("Redirecting...");
        navigate("/dashboard");
        return;
      }

      // If failed, ensure demo user exists via edge function
      setDemoStatus("Setting up demo access...");
      await supabase.functions.invoke("ensure-demo-user");

      // Retry login
      setDemoStatus("Logging in...");
      if (await attemptDemoLogin()) {
        setDemoStatus("Redirecting...");
        navigate("/dashboard");
        return;
      }

      // Final failure
      toast({
        title: "Demo temporarily unavailable",
        description: "Please try again in a moment.",
      });
    } catch {
      toast({
        title: "Demo temporarily unavailable",
        description: "Please try again in a moment.",
      });
    } finally {
      setDemoLoading(false);
      setDemoStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-5">
        {/* Demo access card */}
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-primary">Demo Access for Payment Verification</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-muted-foreground text-xs block">Email</span>
                <p className="font-mono text-foreground text-sm truncate">{DEMO_EMAIL}</p>
              </div>
              <CopyButton value={DEMO_EMAIL} label="Copy Email" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-muted-foreground text-xs block">Password</span>
                <p className="font-mono text-foreground text-sm">{DEMO_PASSWORD}</p>
              </div>
              <CopyButton value={DEMO_PASSWORD} label="Copy Password" />
            </div>
          </div>

          <Button
            className="w-full gap-2 text-base font-semibold h-11"
            onClick={handleDemoLogin}
            disabled={demoLoading}
          >
            {demoLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {demoStatus || "Logging in..."}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Login as Demo User
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            One-click instant access &mdash; no signup required.
          </p>
        </div>

        {/* Regular login card */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2.5 justify-center">
            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">ShadowMD</h1>
              <p className="text-xs text-muted-foreground">AI Clinical Assistant</p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "Sign in to access your dashboard" : "Register to start using ShadowMD"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="doctor@clinic.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
