import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const TrialBanner = () => {
  return (
    <div className="glass-card p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-warning">⏳</span>
        <span className="text-muted-foreground">Free trial: 7 days remaining</span>
      </div>
      <Button size="sm" className="gap-1.5 shrink-0">
        <Crown className="h-3.5 w-3.5" />
        Upgrade — ₹999/mo
      </Button>
    </div>
  );
};

export default TrialBanner;
