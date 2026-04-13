import {
  Siren, CheckCircle, AlertTriangle, ShieldAlert,
  FlaskConical, ArrowRight, Eye, ClipboardCheck, Brain, XCircle,
  Image as ImageIcon, Layers, GitCompareArrows, Tag,
  Activity, ScanSearch, ShieldCheck, Gauge,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ProgressionBadge from "@/components/image-diagnosis/ProgressionBadge";
import ComparisonOutput from "@/components/image-diagnosis/ComparisonOutput";
import ImageMetaHeader from "@/components/image-diagnosis/ImageMetaHeader";
import PerImageSection from "@/components/image-diagnosis/PerImageSection";
import DiagnosesSection from "@/components/image-diagnosis/DiagnosesSection";
import SelfCheckSection from "@/components/image-diagnosis/SelfCheckSection";
import type { MultiImageDiagnosis, ImageComparisonResult } from "@/types/clinical";

interface ImageDiagnosisPanelProps {
  diagnosis: MultiImageDiagnosis | null;
  comparisonResult?: ImageComparisonResult | null;
}

const urgencyBadge = (level: string) => {
  if (level === "HIGH RISK")
    return <Badge variant="destructive" className="text-xs gap-1"><Siren className="h-3 w-3" />🚨 HIGH RISK</Badge>;
  if (level === "Moderate")
    return <Badge className="bg-warning text-warning-foreground text-xs gap-1"><AlertTriangle className="h-3 w-3" />⚠️ Moderate</Badge>;
  return <Badge variant="secondary" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />Low</Badge>;
};

const ImageDiagnosisPanel = ({ diagnosis, comparisonResult }: ImageDiagnosisPanelProps) => {
  if (!diagnosis && !comparisonResult) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">Upload clinical images to get AI-assisted visual diagnosis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comparisonResult && <ComparisonOutput result={comparisonResult} />}

      {diagnosis && (
        <>
          {/* Image Meta: Modality, Region, Quality */}
          <ImageMetaHeader diagnosis={diagnosis} urgencyBadge={urgencyBadge} />

          {/* Pattern Recognition */}
          {diagnosis.pattern_recognition && (
            <div className="glass-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ScanSearch className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Pattern Recognition</h3>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{diagnosis.pattern_recognition}</p>
            </div>
          )}

          {/* Cross-Image Comparison */}
          {diagnosis.cross_image_comparison && diagnosis.cross_image_comparison.length > 0 && (
            <div className="glass-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <GitCompareArrows className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Cross-Image Comparison</h3>
              </div>
              <ul className="space-y-1.5 text-sm text-foreground/80">
                {diagnosis.cross_image_comparison.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary shrink-0 mt-0.5">↔</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Per-Image Observations */}
          <PerImageSection observations={diagnosis.per_image_observations} />

          {/* Diagnoses + Confidence */}
          <DiagnosesSection diagnosis={diagnosis} />

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
              <div className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" />Red Flags</div>
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
                  <li key={i} className="flex items-start gap-2"><span className="text-primary shrink-0">→</span>{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {diagnosis.next_steps.length > 0 && (
            <div className="alert-safe border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold"><ArrowRight className="h-4 w-4" />Next Steps</div>
              <ol className="space-y-1 text-sm">
                {diagnosis.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-success font-semibold shrink-0">{i + 1}.</span>{step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Self-Check */}
          {diagnosis.self_check && <SelfCheckSection selfCheck={diagnosis.self_check} />}

          {/* Disclaimer */}
          <div className="border border-muted rounded-lg p-3 bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ This is AI-assisted analysis for clinical support only. Final diagnosis must be made by a licensed medical professional.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageDiagnosisPanel;
