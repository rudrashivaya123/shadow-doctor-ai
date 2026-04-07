import { GraduationCap, Lightbulb, AlertOctagon, BookOpen } from "lucide-react";
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

      {enabled && analysis && (
        <div className="space-y-3">
          {/* Learning Explanations */}
          {analysis.learning_explanations && analysis.learning_explanations.length > 0 && (
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

          {/* Clinical Insights */}
          {analysis.clinical_insights && analysis.clinical_insights.length > 0 && (
            <div className="glass-card p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">📘 Clinical Insight</span>
              </div>
              <ul className="space-y-1">
                {analysis.clinical_insights.map((insight, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {analysis.common_mistakes && analysis.common_mistakes.length > 0 && (
            <div className="glass-card p-3 space-y-2 border-warning/30">
              <div className="flex items-center gap-1.5">
                <AlertOctagon className="h-3.5 w-3.5 text-warning" />
                <span className="text-xs font-semibold text-foreground">⚠️ Mistake Prevention</span>
              </div>
              <ul className="space-y-1">
                {analysis.common_mistakes.map((mistake, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                    <span className="text-warning mt-0.5 shrink-0">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!analysis.learning_explanations?.length && !analysis.clinical_insights?.length && (
            <p className="text-xs text-muted-foreground">
              Learning explanations will appear after the next analysis with Learning Mode ON.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningMode;
