import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useNavigate } from "react-router-dom";
import type { TrialStatus } from "@/hooks/useTrialStatus";

interface TrialBannerProps {
  trial: TrialStatus;
  onUpgradeSuccess?: () => void;
}

const TrialBanner = ({ trial, onUpgradeSuccess }: TrialBannerProps) => {
  const { initiatePayment } = useRazorpay(onUpgradeSuccess);
  const navigate = useNavigate();

  if (trial.isPremium && trial.daysRemaining > 7) return null;

  let message = "";
  let icon = "⏳";
  let variant: "warning" | "destructive" | "info" = "info";

  if (trial.planStatus === "expired") {
    message = "Your subscription has expired. Renew to continue using ShadowMD.";
    icon = "🔴";
    variant = "destructive";
  } else if (trial.planStatus === "trial") {
    message = `Free trial ends in ${trial.daysRemaining} day${trial.daysRemaining !== 1 ? "s" : ""}`;
    icon = "⏳";
    variant = trial.daysRemaining <= 1 ? "destructive" : "warning";
  } else if (trial.isPremium && trial.daysRemaining <= 7) {
    message = `Plan expires in ${trial.daysRemaining} day${trial.daysRemaining !== 1 ? "s" : ""}`;
    icon = trial.daysRemaining <= 3 ? "⚠️" : "📅";
    variant = trial.daysRemaining <= 3 ? "destructive" : "warning";
  }

  const borderColor = variant === "destructive" ? "border-destructive/30 bg-destructive/10" : variant === "warning" ? "border-warning/30 bg-warning/10" : "border-border";

  return (
    <div className={`rounded-lg border p-3 flex items-center justify-between gap-3 ${borderColor}`}>
      <div className="flex items-center gap-2 text-sm">
        <span>{icon}</span>
        <span className="text-muted-foreground">{message}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="ghost" onClick={() => navigate("/subscription")}>
          View Plan
        </Button>
        <Button size="sm" className="gap-1.5" onClick={initiatePayment}>
          <Crown className="h-3.5 w-3.5" />
          {trial.planStatus === "expired" ? "Renew" : "Upgrade"} — ₹1,499/mo
        </Button>
      </div>
    </div>
  );
};

export default TrialBanner;
