import { useState, useCallback } from "react";
import { Activity, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConsultationInput from "@/components/ConsultationInput";
import AISuggestionsPanel from "@/components/AISuggestionsPanel";
import ConsultationSummary from "@/components/ConsultationSummary";
import LanguageToggle from "@/components/LanguageToggle";
import TrialBanner from "@/components/TrialBanner";
import type { Language, ClinicalAnalysis } from "@/types/clinical";

const Index = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [lastSymptoms, setLastSymptoms] = useState("");
  const [lastNotes, setLastNotes] = useState("");

  const handleSubmit = useCallback(async (symptoms: string, notes: string) => {
    setIsLoading(true);
    setLastSymptoms(symptoms);
    setLastNotes(notes);
    try {
      const result = await mockAnalyze(symptoms, notes, language);
      setAnalysis(result);
    } catch {
      console.error("Analysis failed");
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">ShadowMD</h1>
              <p className="text-[10px] text-muted-foreground leading-none">AI Clinical Assistant</p>
            </div>
          </div>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
      </header>

      {/* Main */}
      <main className="container px-4 py-4 md:py-6 space-y-4">
        <TrialBanner />

        {/* Disclaimer */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          <span>AI-assisted decision support tool only. No patient data is stored permanently.</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left: Input */}
          <div className="lg:col-span-2 space-y-4">
            <ConsultationInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              language={language}
            />

            {/* SOAP Summary */}
            {analysis && (
              <ConsultationSummary
                symptoms={lastSymptoms}
                notes={lastNotes}
                analysis={analysis}
              />
            )}
          </div>

          {/* Right: AI Panel */}
          <div className="lg:col-span-3">
            <AISuggestionsPanel analysis={analysis} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
