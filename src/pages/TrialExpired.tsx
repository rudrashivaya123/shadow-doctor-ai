import {
  Activity, CheckCircle, Crown, Shield, Lock, Mail, Brain, Stethoscope, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRazorpay } from "@/hooks/useRazorpay";

const benefits = [
  { icon: Brain, text: "Unlimited AI consultations" },
  { icon: Stethoscope, text: "Radiology AI image analysis" },
  { icon: FileText, text: "Structured clinical reports" },
  { icon: CheckCircle, text: "Full consultation history" },
];

const TrialExpired = () => {
  const { initiatePayment } = useRazorpay();

  // Razorpay script is now lazy-loaded inside useRazorpay's initiatePayment
  // to avoid forced reflows on initial page load.

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex items-center gap-2.5 justify-center">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold">ShadowMD</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Your free trial has ended</h1>
          <p className="text-muted-foreground text-sm">
            Upgrade to Pro to continue using all clinical AI tools.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/60 p-6 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Pro Plan</span>
            <span className="text-lg font-bold text-foreground">₹1,499<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
          </div>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-sm text-foreground">
                <b.icon className="h-4 w-4 text-primary shrink-0" />
                {b.text}
              </li>
            ))}
          </ul>
        </div>

        <Button
          size="lg"
          className="w-full gap-2 h-12 text-base font-semibold"
          onClick={initiatePayment}
        >
          <Crown className="h-4 w-4" />
          Upgrade to Pro — ₹1,499/month
        </Button>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure Payment</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> SSL Encrypted</span>
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> shadowmd9434@gmail.com</span>
        </div>
      </div>
    </div>
  );
};

export default TrialExpired;
