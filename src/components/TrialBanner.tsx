import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrialStatus } from "@/hooks/useTrialStatus";

interface TrialBannerProps {
  trial: TrialStatus;
  onUpgradeSuccess?: () => void;
}

const TrialBanner = ({ trial }: TrialBannerProps) => {
  if (trial.loading) return null;

  // Premium user — clean Pro badge
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

  // Trial active — minimal info, no upgrade pressure
  if (trial.planStatus === "trial") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1.5 py-1 px-3 text-xs font-medium text-muted-foreground">
          ⏳ Trial · {trial.daysRemaining} day{trial.daysRemaining !== 1 ? "s" : ""} remaining
        </Badge>
      </div>
    );
  }

  // Expired — handled by TrialExpired full-screen page, so nothing here
  return null;
};

export default TrialBanner;
