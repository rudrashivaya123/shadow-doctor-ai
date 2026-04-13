import { ShieldCheck, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SelfCheck } from "@/types/clinical";

interface Props {
  selfCheck: SelfCheck;
}

const SelfCheckSection = ({ selfCheck }: Props) => {
  return (
    <div className="glass-card p-4 space-y-3 border-l-4 border-warning/60">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-warning" />
        <h3 className="font-semibold text-foreground">AI Self-Check</h3>
        {selfCheck.adjusted_confidence && (
          <Badge variant="outline" className="text-xs gap-1 ml-auto">
            <Gauge className="h-3 w-3" />
            Adjusted: {selfCheck.adjusted_confidence}%
          </Badge>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Could this be wrong?</p>
          <p className="text-foreground/80">{selfCheck.could_be_wrong}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-destructive mb-0.5">⚠ Most dangerous missed diagnosis</p>
          <p className="text-foreground/80">{selfCheck.dangerous_missed_diagnosis}</p>
        </div>
      </div>
    </div>
  );
};

export default SelfCheckSection;
