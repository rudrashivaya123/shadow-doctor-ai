import { Activity } from "lucide-react";
import type { CopilotDiagnosis } from "@/types/copilot";

interface Props {
  diagnosis: CopilotDiagnosis[];
}

const DiagnosisCard = ({ diagnosis }: Props) => (
  <div className="rounded-lg border bg-card p-3 space-y-2">
    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wide">
      <Activity className="h-3.5 w-3.5 text-primary" />
      Diagnosis
    </div>
    <div className="space-y-2">
      {diagnosis.map((dx, i) => (
        <div key={i} className="space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{i + 1}. {dx.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{dx.confidence}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${dx.confidence}%`,
                background: dx.confidence >= 70 ? "hsl(var(--primary))" : dx.confidence >= 40 ? "hsl(45 93% 47%)" : "hsl(var(--muted-foreground))",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DiagnosisCard;
