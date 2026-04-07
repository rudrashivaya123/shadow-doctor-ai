import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRazorpay } from "@/hooks/useRazorpay";
import type { TrialStatus } from "@/hooks/useTrialStatus";

interface TrialBannerProps {
  trial: TrialStatus;
  onUpgradeSuccess?: () => void;
}

const TrialBanner = ({ trial, onUpgradeSuccess }: TrialBannerProps) => {
  const { initiatePayment } = useRazorpay(onUpgradeSuccess);

  if (trial.isPremium) return null;

  const message =
    trial.planStatus === "expired"
      ? "Your subscription has expired. Renew to continue."
      : `Free trial: ${trial.daysRemaining} day${trial.daysRemaining !== 1 ? "s" : ""} remaining`;

  const icon = trial.planStatus === "expired" ? "🔴" : "⏳";

  return (
    <div className="glass-card p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <span>{icon}</span>
        <span className="text-muted-foreground">{message}</span>
      </div>
      <Button size="sm" className="gap-1.5 shrink-0" onClick={initiatePayment}>
        <Crown className="h-3.5 w-3.5" />
        {trial.planStatus === "expired" ? "Renew — ₹1,499/mo" : "Upgrade — ₹1,499/mo"}
      </Button>
    </div>
  );
};

export default TrialBanner;
