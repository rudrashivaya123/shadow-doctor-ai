import { ShieldCheck, AlertTriangle, CheckCircle, Siren, Eye, Bot, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MultiAgentMetadata } from "@/types/clinical";

interface Props {
  metadata: MultiAgentMetadata;
}

const MultiAgentPanel = ({ metadata }: Props) => {
  const { validator, safety } = metadata;
  const hasCorrections = validator.corrections.length > 0;
  const hasMissed = validator.missed_diagnoses.length > 0;
  const hasAlerts = safety.safety_alerts.length > 0;
  const hasBlocked = safety.blocked_advice.length > 0;

  return (
    <div className="space-y-3">
      {/* Validator Agent Card */}
      <div className="glass-card p-4 space-y-2 border-l-4 border-blue-500/60">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-400" />
            <h3 className="font-semibold text-foreground text-sm">Validator AI Review</h3>
          </div>
          <Badge variant="outline" className="text-xs gap-1">
            <Gauge className="h-3 w-3" />
            Confidence: {validator.confidence_assessment}
          </Badge>
        </div>

        {hasMissed && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-destructive">Missed Diagnoses Found:</p>
            <ul className="space-y-0.5">
              {validator.missed_diagnoses.map((d, i) => (
                <li key={i} className="text-xs text-destructive/80 flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasCorrections && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-warning">Corrections Applied:</p>
            <ul className="space-y-0.5">
              {validator.corrections.map((c, i) => (
                <li key={i} className="text-xs text-foreground/70 flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 rounded-full bg-warning shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hasMissed && !hasCorrections && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-500" />
            No corrections needed — Diagnostician output validated
          </div>
        )}

        {validator.validation_notes && (
          <p className="text-xs text-muted-foreground italic">{validator.validation_notes}</p>
        )}
      </div>

      {/* Safety Agent Card */}
      <div className={`glass-card p-4 space-y-2 border-l-4 ${
        safety.emergency_override ? "border-destructive" : safety.safety_score >= 80 ? "border-green-500/60" : "border-warning/60"
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            <h3 className="font-semibold text-foreground text-sm">Safety AI Check</h3>
          </div>
          <Badge
            variant={safety.safety_score >= 80 ? "secondary" : "destructive"}
            className="text-xs gap-1"
          >
            Safety: {safety.safety_score}%
          </Badge>
        </div>

        {safety.emergency_override && (
          <div className="bg-destructive/10 border border-destructive/30 rounded p-2 flex items-start gap-2">
            <Siren className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-destructive">⚠ Emergency Escalated by Safety AI</p>
              <p className="text-xs text-destructive/80">{safety.emergency_override_reason}</p>
            </div>
          </div>
        )}

        {hasAlerts && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-destructive">Safety Alerts:</p>
            <ul className="space-y-0.5">
              {safety.safety_alerts.map((a, i) => (
                <li key={i} className="text-xs text-destructive/80 flex items-start gap-1.5">
                  <Siren className="h-3 w-3 mt-0.5 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasBlocked && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-warning">Blocked/Flagged Advice:</p>
            <ul className="space-y-0.5">
              {safety.blocked_advice.map((b, i) => (
                <li key={i} className="text-xs text-foreground/70 flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 rounded-full bg-warning shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!hasAlerts && !hasBlocked && !safety.emergency_override && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Output passed safety review — no concerns
          </div>
        )}

        <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-2">
          {safety.disclaimer}
        </p>
      </div>

      {/* Pipeline badge */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
        <Bot className="h-3 w-3" />
        <span>Processed by 3-agent pipeline: Diagnostician → Validator → Safety</span>
      </div>
    </div>
  );
};

export default MultiAgentPanel;
