import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Mail, Lock, Shield, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceFingerprint";
import { useToast } from "@/hooks/use-toast";

interface TrialRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TrialRegistrationModal = ({ open, onClose, onSuccess }: TrialRegistrationModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      getDeviceId().then(setDeviceId);
      setEmail("");
      setPassword("");
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const { trialRegistrationSchema, firstZodError } = await import("@/lib/validation");
    const result = trialRegistrationSchema.safeParse({ email, password, device_id: deviceId });
    if (!result.success) {
      setError(firstZodError(result));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("register-trial", {
        body: { device_id: deviceId, email, password },
      });

      if (fnError || data?.error) {
        setError(data?.error || "Failed to start trial. Please try again.");
        setLoading(false);
        return;
      }

      // Set session from response
      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      setSuccess(true);
      toast({
        title: "🎉 Trial Activated!",
        description: "You have full access for 3 days.",
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-border/50">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border/30 p-6 text-center">
          <div className="flex items-center gap-2 justify-center mb-3">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold">ShadowMD</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Start Your Free Trial</h2>
          <p className="text-sm text-muted-foreground mt-1">3 days full access • No payment required</p>
        </div>

        <div className="p-6 space-y-5">
          {!success ? (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Create Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button
                className="w-full h-11 gap-2 font-semibold"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Start Free Trial
              </Button>
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
                <span>One trial per device</span>
                <span>No spam</span>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Trial Activated!</h3>
              <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialRegistrationModal;
