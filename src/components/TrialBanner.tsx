import { Crown, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  if (trial.loading) return null;

  // Premium user — show clean Pro badge
  if (trial.isPremium) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-primary/15 text-primary border-primary/30 gap-1.5 py-1 px-3 text-xs font-medium">
          <CheckCircle className="h-3 w-3" />
          Pro Plan Active
        </Badge>
      </div>
    );
  }

  // Expired — show renewal banner
  if (trial.planStatus === "expired") {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-center justify-between gap-3">
        <span className="text-sm text-destructive font-medium">
          Your trial has expired. Upgrade to continue using ShadowMD.
        </span>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={initiatePayment}>
          <Crown className="h-3.5 w-3.5" />
          Upgrade — ₹1,499/mo
        </Button>
      </div>
    );
  }

  // Trial active — slim banner
  if (trial.planStatus === "trial") {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-3 flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          ⏳ Trial ends in {trial.daysRemaining} day{trial.daysRemaining !== 1 ? "s" : ""} 
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="ghost" onClick={() => navigate("/dashboard/subscription")}>
            View Plan
          </Button>
          <Button size="sm" className="gap-1.5" onClick={initiatePayment}>
            <Crown className="h-3.5 w-3.5" />
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default TrialBanner;
