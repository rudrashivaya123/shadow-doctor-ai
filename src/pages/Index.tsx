import { useState, useCallback } from "react";
import { Activity, Shield, LogOut, Stethoscope, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsultationInput from "@/components/ConsultationInput";
import AISuggestionsPanel from "@/components/AISuggestionsPanel";
import ConsultationSummary from "@/components/ConsultationSummary";
import ConsultationHistory from "@/components/ConsultationHistory";
import ImageUpload from "@/components/ImageUpload";
import ImageDiagnosisPanel from "@/components/ImageDiagnosisPanel";
import LanguageToggle from "@/components/LanguageToggle";
import TrialBanner from "@/components/TrialBanner";
import SpecialtySelector from "@/components/SpecialtySelector";
import OfflineIndicator from "@/components/OfflineIndicator";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import LearningMode from "@/components/LearningMode";
import type { Language, Specialty, ClinicalAnalysis, ImageDiagnosis } from "@/types/clinical";

const Index = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [language, setLanguage] = useState<Language>("en");
  const [specialty, setSpecialty] = useState<Specialty>("general");
  const [learningMode, setLearningMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [lastSymptoms, setLastSymptoms] = useState("");
  const [lastNotes, setLastNotes] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageDiagnosis, setImageDiagnosis] = useState<ImageDiagnosis | null>(null);

  const { isOnline, pendingCount, addToQueue, markSynced, queue } = useOfflineSync();

  const saveConsultation = async (symptoms: string, notes: string, result: ClinicalAnalysis) => {
    const { error } = await supabase.from("consultations").insert({
      user_id: user!.id,
      symptoms,
      notes,
      language,
      analysis: result as any,
    });
    if (error) {
      console.error("Failed to save consultation:", error);
    } else {
      setHistoryRefreshKey((k) => k + 1);
    }
  };

  const runAnalysis = useCallback(async (symptoms: string, notes: string, offlineId?: string) => {
    setIsLoading(true);
    setLastSymptoms(symptoms);
    setLastNotes(notes);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-consultation", {
        body: { symptoms, notes, language, specialty, learningMode },
      });

      if (error) throw new Error(error.message || "Analysis failed");

      if (data?.error) {
        toast({ title: "Analysis Error", description: data.error, variant: "destructive" });
        return;
      }

      const result = data as ClinicalAnalysis;
      setAnalysis(result);
      await saveConsultation(symptoms, notes, result);
      if (offlineId) markSynced(offlineId);
    } catch (err) {
      console.error("Analysis failed:", err);
      toast({
        title: "Analysis Failed",
        description: "Could not connect to AI engine. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [language, specialty, learningMode, user]);

  const handleSubmit = useCallback(async (symptoms: string, notes: string) => {
    if (!isOnline) {
      addToQueue(symptoms, notes, language, specialty);
      toast({
        title: "Saved Offline",
        description: "Your consultation will be analyzed when you're back online.",
      });
      return;
    }
    runAnalysis(symptoms, notes);
  }, [isOnline, language, specialty, runAnalysis, addToQueue]);

  const handleSyncAll = useCallback(async () => {
    const pending = queue.filter((e) => !e.synced);
    for (const entry of pending) {
      await runAnalysis(entry.symptoms, entry.notes, entry.id);
    }
    toast({ title: "Sync Complete", description: `${pending.length} consultation(s) synced.` });
  }, [queue, runAnalysis]);

  const handleImageSubmit = useCallback(async (imageBase64: string, mimeType: string, context: string) => {
    setIsImageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64, mimeType, context, language },
      });

      if (error) throw new Error(error.message || "Image analysis failed");

      if (data?.error) {
        toast({ title: "Analysis Error", description: data.error, variant: "destructive" });
        return;
      }

      setImageDiagnosis(data as ImageDiagnosis);
    } catch (err) {
      console.error("Image analysis failed:", err);
      toast({
        title: "Image Analysis Failed",
        description: "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImageLoading(false);
    }
  }, [language]);

  const handleSelectHistory = (c: any) => {
    setLastSymptoms(c.symptoms);
    setLastNotes(c.notes);
    setAnalysis(c.analysis);
  };

  return (
    <div className="min-h-screen bg-background">
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
          <div className="flex items-center gap-2">
            <OfflineIndicator isOnline={isOnline} pendingCount={pendingCount} onSync={handleSyncAll} />
            <LanguageToggle language={language} onChange={setLanguage} />
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4 md:py-6 space-y-4">
        <TrialBanner />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 shrink-0" />
            <span>AI-assisted decision support tool only.</span>
          </div>
          <SpecialtySelector value={specialty} onChange={setSpecialty} />
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="text" className="gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" />
              Symptoms
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Image Dx
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <ConsultationInput onSubmit={handleSubmit} isLoading={isLoading} language={language} />
                {analysis && <RiskScoreBadge score={analysis.risk_score} level={analysis.emergency_level} />}
                <LearningMode enabled={learningMode} onToggle={setLearningMode} analysis={analysis} />
                <ConsultationHistory onSelect={handleSelectHistory} refreshKey={historyRefreshKey} />
                {analysis && (
                  <ConsultationSummary symptoms={lastSymptoms} notes={lastNotes} analysis={analysis} />
                )}
              </div>
              <div className="lg:col-span-3">
                <AISuggestionsPanel analysis={analysis} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <ImageUpload onSubmit={handleImageSubmit} isLoading={isImageLoading} language={language} />
              </div>
              <div className="lg:col-span-3">
                <ImageDiagnosisPanel diagnosis={imageDiagnosis} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
