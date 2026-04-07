import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRazorpay } from "@/hooks/useRazorpay";

interface FeatureGateProps {
  featureName: string;
  onUpgradeSuccess?: () => void;
}

const FeatureGate = ({ featureName, onUpgradeSuccess }: FeatureGateProps) => {
  const { initiatePayment } = useRazorpay(onUpgradeSuccess);

  return (
    <div className="glass-card p-8 flex items-center justify-center min-h-[300px]">
      <div className="text-center space-y-4 max-w-sm">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-semibold text-foreground">{featureName} is a Premium Feature</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade to unlock {featureName.toLowerCase()} and all advanced clinical tools.
          </p>
        </div>
        <Button className="gap-1.5" onClick={initiatePayment}>
          <Crown className="h-4 w-4" />
          Upgrade — ₹1,499/mo
        </Button>
      </div>
    </div>
  );
};

export default FeatureGate;
