import { GraduationCap, Lightbulb } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { ClinicalAnalysis } from "@/types/clinical";

interface LearningModeProps {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  analysis: ClinicalAnalysis | null;
}

const LearningMode = ({ enabled, onToggle, analysis }: LearningModeProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Learning Mode</span>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>

      {enabled && analysis?.learning_explanations && analysis.learning_explanations.length > 0 && (
        <div className="space-y-2">
          {analysis.learning_explanations.map((exp, i) => (
            <div key={i} className="glass-card p-3 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-warning" />
                <span className="text-xs font-semibold text-foreground">{exp.diagnosis}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{exp.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {enabled && (!analysis?.learning_explanations || analysis.learning_explanations.length === 0) && analysis && (
        <p className="text-xs text-muted-foreground">
          Learning explanations will appear after the next analysis.
        </p>
      )}
    </div>
  );
};

export default LearningMode;
