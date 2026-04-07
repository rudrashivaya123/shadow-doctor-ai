import type { TrialStatus } from "@/hooks/useTrialStatus";

const TrialDebugInfo = ({ trial }: { trial: TrialStatus }) => {
  if (trial.loading) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-3 text-xs font-mono space-y-1">
      <p className="font-semibold text-foreground">🐛 Debug: Trial Status</p>
      <p>status: <span className="text-primary font-bold">{trial.planStatus}</span></p>
      <p>isTrialActive: <span className={trial.isTrialActive ? "text-green-500" : "text-destructive"}>{String(trial.isTrialActive)}</span></p>
      <p>isPremium: <span className={trial.isPremium ? "text-green-500" : "text-destructive"}>{String(trial.isPremium)}</span></p>
      <p>daysRemaining: {trial.daysRemaining}</p>
      <p>expiryDate: {trial.expiryDate ?? "null"}</p>
      <p>currentDate: {new Date().toISOString()}</p>
    </div>
  );
};

export default TrialDebugInfo;
