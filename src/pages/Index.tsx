import { useState, useCallback } from "react";
import { Activity, Shield } from "lucide-react";
import ConsultationInput from "@/components/ConsultationInput";
import AISuggestionsPanel from "@/components/AISuggestionsPanel";
import ConsultationSummary from "@/components/ConsultationSummary";
import LanguageToggle from "@/components/LanguageToggle";
import TrialBanner from "@/components/TrialBanner";
import type { Language, ClinicalAnalysis } from "@/types/clinical";

// Mock AI analysis — replace with real API call
const mockAnalyze = async (symptoms: string, notes: string, language: Language): Promise<ClinicalAnalysis> => {
  await new Promise((r) => setTimeout(r, 1500));

  return {
    differential_diagnosis: [
      "Dengue Fever — high-grade fever with body aches and thrombocytopenia risk",
      "Viral Upper Respiratory Infection — common, self-limiting",
      "Malaria — endemic area, must rule out with blood smear",
      "Typhoid Fever — consider if fever >5 days with GI symptoms",
      "Chikungunya — joint pain with fever in monsoon season",
    ],
    missed_risks: [
      "Dengue hemorrhagic fever — check platelet count urgently",
      "Leptospirosis — ask about water exposure during monsoon",
    ],
    questions_to_ask: [
      "Any recent travel to endemic areas?",
      "History of water logging or flooding near residence?",
      "Any bleeding from gums or petechiae?",
      "Is the patient taking any self-medication (NSAIDs)?",
      "Any sick contacts or family members with similar symptoms?",
    ],
    tests_suggested: [
      "CBC with platelet count",
      "Dengue NS1 antigen + IgM/IgG",
      "Peripheral blood smear for malaria",
      "Widal test (if fever >5 days)",
      "Liver function tests",
    ],
    red_flags: [
      "If platelet count <100,000 — monitor for dengue hemorrhagic fever",
      "Avoid NSAIDs/Aspirin until dengue is ruled out",
      "Watch for signs of plasma leakage (rising hematocrit, pleural effusion)",
    ],
  };
};

const Index = () => {
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
