import { ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RiskScoreBadgeProps {
  score?: number;
  level: string;
}

const RiskScoreBadge = ({ score, level }: RiskScoreBadgeProps) => {
  const numScore = score ?? (level === "HIGH RISK" ? 85 : level === "Moderate" ? 50 : 20);

  const color =
    numScore >= 70
      ? "bg-destructive text-destructive-foreground"
      : numScore >= 40
      ? "bg-warning text-warning-foreground"
      : "bg-success text-success-foreground";

  const Icon = numScore >= 70 ? ShieldAlert : numScore >= 40 ? Shield : ShieldCheck;
  const label = numScore >= 70 ? "High Risk" : numScore >= 40 ? "Medium Risk" : "Low Risk";

  return (
    <div className="glass-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold text-foreground">Risk Score</span>
        </div>
        <Badge className={`${color} text-[10px] h-5`}>
          {label} — {numScore}/100
        </Badge>
      </div>
      <Progress
        value={numScore}
        className="h-1.5"
      />
    </div>
  );
};

export default RiskScoreBadge;
