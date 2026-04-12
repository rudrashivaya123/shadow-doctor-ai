import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProgressionStatus } from "@/types/clinical";

interface ProgressionBadgeProps {
  status: ProgressionStatus;
}

const config: Record<ProgressionStatus, { icon: typeof TrendingUp; label: string; emoji: string; className: string }> = {
  improving: { icon: TrendingUp, label: "Improving", emoji: "🟢", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  worsening: { icon: TrendingDown, label: "Worsening", emoji: "🔴", className: "bg-destructive/15 text-destructive border-destructive/30" },
  stable: { icon: Minus, label: "Stable", emoji: "🟡", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  mixed: { icon: Activity, label: "Mixed Response", emoji: "🟠", className: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30" },
};

const ProgressionBadge = ({ status }: ProgressionBadgeProps) => {
  const c = config[status];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`gap-1.5 text-xs font-medium px-2.5 py-1 ${c.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {c.emoji} {c.label}
    </Badge>
  );
};

export default ProgressionBadge;
