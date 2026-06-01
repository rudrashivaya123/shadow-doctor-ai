import { AlertTriangle, AlertCircle, CheckCircle, Siren, Stethoscope, Brain, FlaskConical, Pill, ShieldAlert, Lock, Crown, Leaf } from "lucide-react";
import type { ClinicalAnalysis } from "@/types/clinical";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MultiAgentPanel from "@/components/MultiAgentPanel";

interface AISuggestionsPanelProps {
  analysis: ClinicalAnalysis | null;
  reasoningLocked?: boolean;
}

const emergencyBadge = (level: string) => {
  if (level === "HIGH RISK")
    return <Badge variant="destructive" className="text-xs gap-1"><Siren className="h-3 w-3" />🚨 HIGH RISK</Badge>;
  if (level === "Moderate")
    return <Badge className="bg-warning text-warning-foreground text-xs gap-1"><AlertTriangle className="h-3 w-3" />⚠️ Moderate</Badge>;
  return <Badge variant="secondary" className="text-xs gap-1"><CheckCircle className="h-3 w-3" />Low</Badge>;
};

const AISuggestionsPanel = ({ analysis, reasoningLocked = false }: AISuggestionsPanelProps) => {
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

  const safe = {
    ...analysis,
    red_flags: analysis.red_flags ?? [],
    immediate_management: analysis.immediate_management ?? [],
    missed_possibilities: analysis.missed_possibilities ?? [],
    differentials: analysis.differentials ?? [],
    investigations: analysis.investigations ?? [],
    treatment: analysis.treatment ?? [],
    otc_recommendations: analysis.otc_recommendations ?? [],
    otc_safety_level: analysis.otc_safety_level ?? "LOW_RISK",
    otc_note: analysis.otc_note ?? "",
  };

  const isEmergency = safe.emergency_level === "HIGH RISK" || safe.otc_safety_level === "NOT_RECOMMENDED";
  const otcBadge = isEmergency
    ? { cls: "bg-destructive text-destructive-foreground", label: "🔴 OTC Not Recommended" }
    : safe.otc_safety_level === "CAUTION"
    ? { cls: "bg-warning text-warning-foreground", label: "🟡 Use With Caution" }
    : { cls: "bg-success text-success-foreground", label: "🟢 Low Risk" };

  return (
    <div className="space-y-4">
      {/* Primary Diagnosis & Emergency Level */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Primary Diagnosis</h3>
          </div>
          {emergencyBadge(safe.emergency_level)}
        </div>
        <p className="text-sm text-foreground/90 font-medium">{safe.primary_diagnosis}</p>
      </div>

      {/* Red Flags */}
      {safe.red_flags.length > 0 && (
        <div className="alert-critical border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4" />
            Red Flags
          </div>
          <ul className="space-y-1 text-sm">
            {safe.red_flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Immediate Management */}
      {safe.immediate_management.length > 0 && (
        <div className="alert-warning border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <Siren className="h-4 w-4" />
            Immediate Management
          </div>
          <ol className="space-y-1 text-sm">
            {safe.immediate_management.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-warning font-semibold shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Missed Possibilities */}
      {safe.missed_possibilities.length > 0 && (
        <div className="alert-warning border rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Missed Possibilities
          </div>
          <ul className="space-y-1 text-sm">
            {safe.missed_possibilities.map((risk, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Differential Diagnoses */}
      <div className="glass-card p-4 space-y-2">
        <h3 className="font-semibold text-foreground">Differential Diagnoses (Ranked)</h3>
        <ol className="space-y-1.5 text-sm text-foreground/80">
          {safe.differentials.map((dx, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
              {dx}
            </li>
          ))}
        </ol>
      </div>

      {/* Investigations */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Recommended Investigations</h3>
        </div>
        <ul className="space-y-1.5 text-sm text-foreground/80">
          {safe.investigations.map((test, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary shrink-0">→</span>
              {test}
            </li>
          ))}
        </ul>
      </div>

      {/* Treatment Plan */}
      <div className="alert-safe border rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <Pill className="h-4 w-4" />
          Treatment Plan
        </div>
        <ol className="space-y-1 text-sm">
          {safe.treatment.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-success font-semibold shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* OTC Medication Recommendations */}
      <div className="glass-card p-4 space-y-3 border-l-2 border-l-teal-500/60">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-teal-400" />
            <h3 className="font-semibold text-foreground">OTC Medication Recommendations</h3>
          </div>
          <Badge className={`${otcBadge.cls} text-[10px] h-5`}>{otcBadge.label}</Badge>
        </div>

        {isEmergency ? (
          <div className="alert-critical border rounded-md p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {safe.otc_note ||
                "OTC medications are not appropriate as primary management for this presentation. Immediate medical evaluation is recommended."}
            </span>
          </div>
        ) : safe.otc_recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {safe.otc_note || "No OTC medications recommended for this presentation."}
          </p>
        ) : (
          <>
            {safe.otc_safety_level === "CAUTION" && safe.otc_note && (
              <div className="alert-warning border rounded-md p-2 text-xs flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{safe.otc_note}</span>
              </div>
            )}
            <div className="space-y-2">
              {safe.otc_recommendations.map((rx, i) => (
                <div key={i} className="rounded-md border border-border/60 bg-card/40 p-3 space-y-1.5">
                  <div className="text-xs font-semibold text-teal-400 uppercase tracking-wide">
                    {rx.symptom}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {rx.medication}
                    {rx.active_ingredient && (
                      <span className="text-muted-foreground font-normal"> · {rx.active_ingredient}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-foreground/80">
                    <div><span className="text-muted-foreground">Adult dose:</span> {rx.adult_dose}</div>
                    <div><span className="text-muted-foreground">Max/day:</span> {rx.max_daily_dose}</div>
                  </div>
                  {rx.precautions && (
                    <div className="text-xs text-warning flex items-start gap-1.5">
                      <ShieldAlert className="h-3 w-3 shrink-0 mt-0.5" />
                      <span>{rx.precautions}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-[10px] text-muted-foreground italic border-t border-border/40 pt-2">
          OTC recommendations are intended for symptomatic relief only and do not replace professional medical evaluation, diagnosis, or treatment.
        </p>
      </div>



      {/* Clinical Reasoning */}
      {safe.reasoning && (
        reasoningLocked ? (
          <div className="glass-card p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Clinical Reasoning</h3>
              <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
            </div>
            <p className="text-sm text-muted-foreground/50 leading-relaxed blur-sm select-none" aria-hidden>
              {safe.reasoning}
            </p>
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
              <Button size="sm" className="gap-1.5">
                <Crown className="h-3.5 w-3.5" />
                Upgrade to Unlock
              </Button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Clinical Reasoning</h3>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{safe.reasoning}</p>
          </div>
        )
      )}

      {/* Multi-Agent Review Panel */}
      {analysis.multi_agent && (
        <MultiAgentPanel metadata={analysis.multi_agent} />
      )}
    </div>
  );
};

export default AISuggestionsPanel;
