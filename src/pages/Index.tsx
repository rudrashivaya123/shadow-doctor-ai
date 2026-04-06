import { useState, useCallback } from "react";
import { Activity, Shield, LogOut, Stethoscope, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import type { Language, ClinicalAnalysis, ImageDiagnosis } from "@/types/clinical";

const Index = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [lastSymptoms, setLastSymptoms] = useState("");
  const [lastNotes, setLastNotes] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Image diagnosis state
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageDiagnosis, setImageDiagnosis] = useState<ImageDiagnosis | null>(null);

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

  const handleSubmit = useCallback(async (symptoms: string, notes: string) => {
    setIsLoading(true);
    setLastSymptoms(symptoms);
    setLastNotes(notes);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-consultation", {
        body: { symptoms, notes, language },
      });

      if (error) throw new Error(error.message || "Analysis failed");

      if (data?.error) {
        toast({ title: "Analysis Error", description: data.error, variant: "destructive" });
        return;
      }

      const result = data as ClinicalAnalysis;
      setAnalysis(result);
      await saveConsultation(symptoms, notes, result);
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
  }, [language, user]);

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
            <LanguageToggle language={language} onChange={setLanguage} />
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4 md:py-6 space-y-4">
        <TrialBanner />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          <span>AI-assisted decision support tool only. No patient data is stored permanently.</span>
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
