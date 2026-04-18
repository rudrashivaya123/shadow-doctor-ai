import { useState, useCallback } from "react";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import TrialBanner from "@/components/TrialBanner";
import FeatureGate from "@/components/FeatureGate";
import EviSmartInput from "@/components/evismart/EviSmartInput";
import EviSmartOutput from "@/components/evismart/EviSmartOutput";
import type { EviSmartResult } from "@/types/evismart";
import type { Language } from "@/types/clinical";

interface Props {
  language: Language;
}

const EviSmartPage = ({ language }: Props) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EviSmartResult | null>(null);
  const trial = useTrialStatus();
  const locked = isFeatureLocked(trial);

  const handleSubmit = useCallback(async (data: { symptoms: string; age?: string; gender?: string; vitals?: string }) => {
    setIsLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("evismart", {
        body: { ...data, language },
      });
      if (error) throw new Error(error.message || "Analysis failed");
      if (res?.error) {
        toast({ title: "Error", description: res.error, variant: "destructive" });
        return;
      }
      setResult(res as EviSmartResult);
    } catch {
      toast({ title: "Failed", description: "Could not get EviSmart advice. Try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [language, toast]);

  if (locked) {
    return (
      <div className="container px-4 py-4 space-y-4">
        <TrialBanner trial={trial} />
        <FeatureGate featureName="EviSmart" />
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
          <EviSmartInput onSubmit={handleSubmit} isLoading={isLoading} onReset={() => setResult(null)} />
        </div>
        <div className="lg:col-span-3">
          <EviSmartOutput result={result} />
        </div>
      </div>
    </div>
  );
};

export default EviSmartPage;
