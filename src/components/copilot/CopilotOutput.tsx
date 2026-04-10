import { Brain, Siren } from "lucide-react";
import DiagnosisCard from "./DiagnosisCard";
import PrescriptionCard from "./PrescriptionCard";
import RedFlagCard from "./RedFlagCard";
import InvestigationCard from "./InvestigationCard";
import FollowUpCard from "./FollowUpCard";
import type { CopilotResult } from "@/types/copilot";

interface Props {
  result: CopilotResult | null;
}

const CopilotOutput = ({ result }: Props) => {
  if (!result) {
    return (
      <div className="border border-dashed border-muted-foreground/20 rounded-lg p-6 flex items-center justify-center min-h-[350px]">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">Enter symptoms to get OPD Copilot advice</p>
        </div>
      </div>
    );
  }

  if (result.emergency) {
    return (
      <div className="space-y-3">
        <div className="border-2 border-destructive bg-destructive/10 rounded-lg p-5 text-center space-y-2">
          <Siren className="h-8 w-8 text-destructive mx-auto" />
          <p className="text-lg font-bold text-destructive">🚨 REFER IMMEDIATELY</p>
          {result.emergency_message && (
            <p className="text-sm text-destructive/80">{result.emergency_message}</p>
          )}
        </div>
        <DiagnosisCard diagnosis={result.diagnosis} />
        {result.red_flags.length > 0 && <RedFlagCard flags={result.red_flags} />}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DiagnosisCard diagnosis={result.diagnosis} />
      <PrescriptionCard prescriptions={result.prescriptions} advice={result.advice} />
      {result.red_flags.length > 0 && <RedFlagCard flags={result.red_flags} />}
      {result.investigations.length > 0 && <InvestigationCard investigations={result.investigations} />}
      <FollowUpCard followUp={result.follow_up} uncertainty={result.uncertainty_note} />
    </div>
  );
};

export default CopilotOutput;
