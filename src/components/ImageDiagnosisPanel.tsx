import {
  Siren, CheckCircle, AlertTriangle, ShieldAlert,
  FlaskConical, ArrowRight, Eye, ClipboardCheck, Brain, XCircle, ImageIcon, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { MultiImageDiagnosis } from "@/types/clinical";

interface ImageDiagnosisPanelProps {
  diagnosis: MultiImageDiagnosis | null;
}

const urgencyBadge = (level: string) => {
  if (level === "HIGH RISK")
    return <Badge variant="destructive" className="text-xs gap-1"><Siren className="h-3 w-3" />🚨 HIGH RISK</Badge>;
  if (level === "Moderate")
    return <Badge className="bg-warning text-warning-foreground text-xs gap-1"><AlertTriangle className="h-3 w-3" />⚠️ Moderate</Badge>;
  return <Badge variant="secondary" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />Low</Badge>;
};

const confidenceColor = (c: number) => {
  if (c >= 70) return "text-destructive";
  if (c >= 40) return "text-warning";
  return "text-muted-foreground";
};

const ImageDiagnosisPanel = ({ diagnosis }: ImageDiagnosisPanelProps) => {
  if (!diagnosis) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">
            Upload clinical images to get AI-assisted visual diagnosis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Combined Summary + Urgency */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Combined AI Summary</h3>
          </div>
          {urgencyBadge(diagnosis.urgency_level)}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{diagnosis.combined_summary}</p>
        {diagnosis.progression_notes && (
          <p className="text-xs text-primary/80 italic border-l-2 border-primary/30 pl-2">{diagnosis.progression_notes}</p>
        )}
      </div>

      {/* Per-Image Observations */}
      {diagnosis.per_image_observations.length > 0 && (
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Per-Image Observations</h3>
          </div>
          <div className="space-y-3">
            {diagnosis.per_image_observations.map((obs, i) => (
              <div key={i} className="bg-muted/40 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold text-primary">{obs.image_label}</p>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {obs.findings.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-primary shrink-0 mt-0.5">→</span>{f}
                    </li>
                  ))}
                </ul>
                {obs.notes && <p className="text-xs text-muted-foreground italic">{obs.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Possible Diagnoses */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="font-semibold text-foreground">Possible Diagnoses</h3>
        <div className="space-y-3">
          {diagnosis.possible_diagnoses.map((dx, i) => (
            <div key={i} className="bg-muted/40 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{dx.name}</span>
                <span className={`text-sm font-bold ${confidenceColor(dx.confidence)}`}>{dx.confidence}%</span>
              </div>
              <Progress value={dx.confidence} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{dx.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Differential Diagnosis */}
      {diagnosis.differential_diagnosis.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Differential Diagnosis</h3>
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

      {/* Key Visual Findings */}
      {diagnosis.key_visual_findings.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Key Visual Findings</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/80">
            {diagnosis.key_visual_findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">→</span>{f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Diagnostic Criteria */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Diagnostic Criteria</h3>
        </div>
        {diagnosis.diagnostic_criteria.matched.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-success">Matched</p>
            <ul className="space-y-1 text-sm">
              {diagnosis.diagnostic_criteria.matched.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground/80">
                  <CheckCircle className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />{c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {diagnosis.diagnostic_criteria.missing.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Missing</p>
            <ul className="space-y-1 text-sm">
              {diagnosis.diagnostic_criteria.missing.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />{c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Red Flags */}
      {diagnosis.red_flags.length > 0 && (
        <div className="alert-critical border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4" />Red Flags
          </div>
          <ul className="space-y-1 text-sm">
            {diagnosis.red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />{flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Tests */}
      {diagnosis.suggested_tests.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Suggested Tests</h3>
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/80">
            {diagnosis.suggested_tests.map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary shrink-0">→</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {diagnosis.next_steps.length > 0 && (
        <div className="alert-safe border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <ArrowRight className="h-4 w-4" />Next Steps
          </div>
          <ol className="space-y-1 text-sm">
            {diagnosis.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-success font-semibold shrink-0">{i + 1}.</span>{step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default ImageDiagnosisPanel;
