import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import type { ClinicalAnalysis } from "@/types/clinical";

interface AISuggestionsPanelProps {
  analysis: ClinicalAnalysis | null;
}

const AISuggestionsPanel = ({ analysis }: AISuggestionsPanelProps) => {
  if (!analysis) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">
            Enter patient symptoms to get AI-assisted clinical suggestions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Red Flags */}
      {analysis.red_flags.length > 0 && (
        <div className="alert-critical border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Red Flags
          </div>
          <ul className="space-y-1 text-sm">
            {analysis.red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missed Risks */}
      {analysis.missed_risks.length > 0 && (
        <div className="alert-warning border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Missed Possibilities
          </div>
          <ul className="space-y-1 text-sm">
            {analysis.missed_risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Differential Diagnosis */}
      <div className="glass-card p-4 space-y-2">
        <h3 className="font-semibold text-foreground">Differential Diagnoses</h3>
        <ol className="space-y-1.5 text-sm text-foreground/80">
          {analysis.differential_diagnosis.map((dx, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
              {dx}
            </li>
          ))}
        </ol>
      </div>

      {/* Questions to Ask */}
      <div className="glass-card p-4 space-y-2">
        <h3 className="font-semibold text-foreground">Questions to Ask</h3>
        <ul className="space-y-1.5 text-sm text-foreground/80">
          {analysis.questions_to_ask.map((q, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary shrink-0">→</span>
              {q}
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested Tests */}
      <div className="alert-safe border rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle className="h-4 w-4" />
          Suggested Investigations
        </div>
        <ul className="space-y-1 text-sm">
          {analysis.tests_suggested.map((test, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
              {test}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AISuggestionsPanel;
