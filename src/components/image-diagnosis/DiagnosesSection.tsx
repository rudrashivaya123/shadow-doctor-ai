import { Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { MultiImageDiagnosis } from "@/types/clinical";

interface Props {
  diagnosis: MultiImageDiagnosis;
}

const confidenceColor = (c: number) => {
  if (c >= 70) return "text-destructive";
  if (c >= 40) return "text-warning";
  return "text-muted-foreground";
};

const DiagnosesSection = ({ diagnosis }: Props) => {
  return (
    <>
      {/* Possible Diagnoses */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="font-semibold text-foreground">Differential Diagnosis (Ranked)</h3>
        <div className="space-y-3">
          {diagnosis.possible_diagnoses.map((dx, i) => (
            <div key={i} className="bg-muted/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{i + 1}. {dx.name}</span>
                <span className={`text-sm font-bold ${confidenceColor(dx.confidence)}`}>{dx.confidence}%</span>
              </div>
              <Progress value={dx.confidence} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{dx.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Additional differentials */}
      {diagnosis.differential_diagnosis.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Other Differentials</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/80">
            {diagnosis.differential_diagnosis.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">•</span>{d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default DiagnosesSection;
