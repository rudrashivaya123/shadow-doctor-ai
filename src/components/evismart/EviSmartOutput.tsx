import { AlertTriangle, Siren, Pill, FlaskConical, BookOpen, Lightbulb, ArrowRight, AlertCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { EviSmartResult } from "@/types/evismart";

interface Props {
  result: EviSmartResult | null;
}

const ConfidenceBar = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2 w-full">
    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background: value >= 70 ? "hsl(var(--primary))" : value >= 40 ? "hsl(var(--warning, 45 93% 47%))" : "hsl(var(--muted-foreground))",
        }}
      />
    </div>
    <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">{value}%</span>
  </div>
);

const EviSmartOutput = ({ result }: Props) => {
  if (!result) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[350px]">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">
            Enter symptoms to get rapid EviSmart advice
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Probable Diagnoses */}
      <div className="glass-card p-3 space-y-2">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">Probable Diagnoses</h4>
        <div className="space-y-2">
          {result.probable_diagnoses.map((dx, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{i + 1}. {dx.name}</span>
              </div>
              <ConfidenceBar value={dx.confidence} />
            </div>
          ))}
        </div>
      </div>

      {/* Red Flags */}
      {result.red_flags.length > 0 && (
        <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs">
            <Siren className="h-3.5 w-3.5" />
            RED FLAGS
          </div>
          <ul className="space-y-1">
            {result.red_flags.map((flag, i) => (
              <li key={i} className="text-xs text-destructive/90 flex items-start gap-1.5">
                <span className="mt-1 h-1 w-1 rounded-full bg-destructive shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Treatment Plan */}
      <div className="glass-card p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Pill className="h-3.5 w-3.5 text-primary" />
          TREATMENT
        </div>
        <div className="space-y-1.5">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">First-line</span>
            <p className="text-sm text-foreground">{result.first_line_treatment}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Alternatives</span>
            <p className="text-sm text-foreground/80">{result.alternatives}</p>
          </div>
        </div>
      </div>

      {/* Investigations */}
      {result.investigations.length > 0 && (
        <div className="glass-card p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            INVESTIGATIONS
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.investigations.map((test, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">{test}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Snapshot */}
      <div className="glass-card p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          EVIDENCE SNAPSHOT
        </div>
        <ul className="space-y-1">
          {result.evidence_snapshot.map((point, i) => (
            <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
              <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Clinical Pearl */}
      <div className="border border-primary/20 bg-primary/5 rounded-lg p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Lightbulb className="h-3.5 w-3.5" />
          CLINICAL PEARL
        </div>
        <p className="text-xs text-foreground/90">{result.clinical_pearl}</p>
      </div>

      {/* Refer If + Uncertainty */}
      <div className="glass-card p-3 space-y-2">
        {result.refer_if && (
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Refer if</span>
              <p className="text-xs text-foreground/80">{result.refer_if}</p>
            </div>
          </div>
        )}
        {result.uncertainty_note && (
          <div className="flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground italic">{result.uncertainty_note}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EviSmartOutput;
