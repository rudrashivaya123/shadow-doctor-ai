import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrialStatus } from "@/hooks/useTrialStatus";

interface TrialBannerProps {
  trial: TrialStatus;
}

const TrialBanner = ({ trial }: TrialBannerProps) => {
  if (trial.isPremium) return null;

  return (
    <div className="glass-card p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-warning">⏳</span>
        <span className="text-muted-foreground">
          Free trial: {trial.daysRemaining} day{trial.daysRemaining !== 1 ? "s" : ""} remaining
        </span>
      </div>
      <Button size="sm" className="gap-1.5 shrink-0">
        <Crown className="h-3.5 w-3.5" />
        Upgrade — ₹1,499/mo
      </Button>
    </div>
  );
};

export default TrialBanner;
