import { useState, useCallback } from "react";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import TrialBanner from "@/components/TrialBanner";
import FeatureGate from "@/components/FeatureGate";
import CopilotInput from "@/components/copilot/CopilotInput";
import CopilotOutput from "@/components/copilot/CopilotOutput";
import VoiceControls from "@/components/VoiceControls";
import type { CopilotResult } from "@/types/copilot";
import type { Language } from "@/types/clinical";

interface Props {
  language: Language;
}

const CopilotPage = ({ language }: Props) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CopilotResult | null>(null);
  const trial = useTrialStatus();
  const locked = isFeatureLocked(trial);

  const handleSubmit = useCallback(async (data: { symptoms: string; age?: string; gender?: string; temp?: string; spo2?: string }) => {
    setIsLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("copilot", {
        body: { ...data, language },
      });
      if (error) throw new Error(error.message || "Analysis failed");
      if (res?.error) {
        toast({ title: "Error", description: res.error, variant: "destructive" });
        return;
      }
      setResult(res as CopilotResult);
    } catch {
      toast({ title: "Failed", description: "Could not get Copilot advice. Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [language, toast]);

  if (locked) {
    return (
      <div className="container px-4 py-4 space-y-4">
        <TrialBanner trial={trial} />
        <FeatureGate featureName="OPD Copilot" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-4 md:py-6 space-y-4">
      <TrialBanner trial={trial} />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        <span>AI decision support only. Always verify with clinical judgment.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <CopilotInput onSubmit={handleSubmit} isLoading={isLoading} onReset={() => setResult(null)} language={language} />
        </div>
        <div className="lg:col-span-3 space-y-3">
          {result && <CopilotVoicePanel result={result} language={language} />}
          <CopilotOutput result={result} />
        </div>
      </div>
    </div>
  );
};

export default CopilotPage;
