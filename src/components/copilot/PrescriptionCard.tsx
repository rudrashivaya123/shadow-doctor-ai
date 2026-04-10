import { Pill, Heart } from "lucide-react";
import type { CopilotPrescription } from "@/types/copilot";

interface Props {
  prescriptions: CopilotPrescription[];
  advice: string[];
}

const PrescriptionCard = ({ prescriptions, advice }: Props) => (
  <div className="rounded-lg border bg-card p-3 space-y-2">
    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wide">
      <Pill className="h-3.5 w-3.5 text-primary" />
      Prescription
    </div>
    <div className="space-y-1">
      {prescriptions.map((rx, i) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          <span className="text-primary font-mono text-xs mt-0.5">{i + 1}.</span>
          <div>
            <span className="font-medium text-foreground">{rx.drug}</span>
            <span className="text-muted-foreground"> — {rx.dose}, {rx.duration}</span>
          </div>
        </div>
      ))}
    </div>
    {advice.length > 0 && (
      <div className="border-t pt-2 space-y-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase">
          <Heart className="h-3 w-3" />
          Advice
        </div>
        {advice.map((a, i) => (
          <p key={i} className="text-xs text-foreground/80">• {a}</p>
        ))}
      </div>
    )}
  </div>
);

export default PrescriptionCard;
