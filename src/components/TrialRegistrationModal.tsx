import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Phone, Shield, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceFingerprint";
import { useToast } from "@/hooks/use-toast";

interface TrialRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "phone" | "otp" | "success";

const TrialRegistrationModal = ({ open, onClose, onSuccess }: TrialRegistrationModalProps) => {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      getDeviceId().then(setDeviceId);
      setStep("phone");
      setOtp("");
      setError(null);
      setDevOtp(null);
    }
  }, [open]);

  const handleSendOtp = async () => {
    if (!/^\+\d{10,15}$/.test(phone)) {
      setError("Enter a valid phone number (e.g., +919876543210)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("register-trial", {
        body: { device_id: deviceId, phone },
      });

      if (fnError || data?.error) {
        setError(data?.error || "Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }

      // In dev mode, we get the OTP back
      if (data?.dev_otp) {
        setDevOtp(data.dev_otp);
      }

      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-trial-otp", {
        body: { device_id: deviceId, phone, otp },
      });

      if (fnError || data?.error) {
        setError(data?.error || "OTP verification failed. Please try again.");
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

      setStep("success");
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
          {step === "phone" && (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  We'll send a one-time verification code to this number.
                </p>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button
                className="w-full h-11 gap-2 font-semibold"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Send Verification Code
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Enter OTP</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-11 text-center text-xl tracking-[0.5em] font-mono"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code sent to {phone}
                </p>
                {devOtp && (
                  <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 text-center">
                    <p className="text-xs text-warning font-medium">DEV MODE — OTP: <span className="font-mono text-sm">{devOtp}</span></p>
                  </div>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button
                className="w-full h-11 gap-2 font-semibold"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Verify & Start Trial
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
              >
                Change phone number
              </Button>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-4 space-y-3">
              <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Trial Activated!</h3>
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          )}

          {/* Trust indicators */}
          {step !== "success" && (
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure</span>
              <span>One trial per device</span>
              <span>No spam</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrialRegistrationModal;
