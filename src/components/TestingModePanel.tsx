import { FlaskConical, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTestingMode } from "@/contexts/TestingModeContext";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useState } from "react";

const isDev = true; // Always available for testing

const TestingModePanel = () => {
  const {
    isTestingMode, simulatedState, setSimulatedState, toggleTestingMode,
    isTestDuration, toggleTestDuration, expireTrialNow,
  } = useTestingMode();
  const trial = useTrialStatus();
  const [expiring, setExpiring] = useState(false);

  if (!isDev) return null;

  if (!isTestingMode) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTestingMode}
        title="Enable Testing Mode"
        className="text-muted-foreground hover:text-warning"
      >
        <FlaskConical className="h-4 w-4" />
      </Button>
    );
  }

  const handleExpire = async () => {
    setExpiring(true);
    await expireTrialNow();
    setExpiring(false);
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-warning/30 bg-warning/5">
      <div className="flex items-center justify-between">
        <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px] px-1.5">TEST MODE</Badge>
        <Button variant="ghost" size="icon" onClick={toggleTestingMode} title="Disable" className="text-warning h-6 w-6">
          <FlaskConical className="h-3 w-3" />
        </Button>
      </div>

      {/* State simulator */}
      <Select
        value={simulatedState ?? ""}
        onValueChange={(v) => setSimulatedState(v as "trial" | "active" | "expired")}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Simulate state" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="trial">Trial User</SelectItem>
          <SelectItem value="active">Active User</SelectItem>
          <SelectItem value="expired">Expired User</SelectItem>
        </SelectContent>
      </Select>

      {/* 2-min trial toggle */}
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Timer className="h-3 w-3" /> 2-min trial
        </span>
        <Switch checked={isTestDuration} onCheckedChange={toggleTestDuration} className="scale-75" />
      </div>

      {/* Expire now button */}
      <Button
        variant="destructive"
        size="sm"
        className="h-7 text-xs gap-1"
        onClick={handleExpire}
        disabled={expiring || trial.planStatus === "expired" || trial.isPremium}
      >
        <Zap className="h-3 w-3" />
        {expiring ? "Expiring..." : "Expire Trial Now"}
      </Button>

      {/* Debug info */}
      <div className="text-[10px] font-mono text-muted-foreground space-y-0.5 pt-1 border-t border-border/50">
        <p>status: <span className="text-foreground font-semibold">{trial.planStatus}</span></p>
        <p>premium: <span className={trial.isPremium ? "text-green-500" : "text-destructive"}>{String(trial.isPremium)}</span></p>
        <p>trial: <span className={trial.isTrialActive ? "text-green-500" : "text-destructive"}>{String(trial.isTrialActive)}</span></p>
        <p>days: {trial.daysRemaining}</p>
        <p>expiry: {trial.expiryDate ? new Date(trial.expiryDate).toLocaleString() : "—"}</p>
      </div>
    </div>
  );
};

export default TestingModePanel;
