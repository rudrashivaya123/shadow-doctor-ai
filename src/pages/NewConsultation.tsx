import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Shield, Stethoscope, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsultationInput from "@/components/ConsultationInput";
import AISuggestionsPanel from "@/components/AISuggestionsPanel";
import ConsultationSummary from "@/components/ConsultationSummary";
import ImageUpload from "@/components/ImageUpload";
import ImageDiagnosisPanel from "@/components/ImageDiagnosisPanel";
import SpecialtySelector from "@/components/SpecialtySelector";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import LearningMode from "@/components/LearningMode";
import PatientSelector from "@/components/PatientSelector";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import TrialBanner from "@/components/TrialBanner";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import FeatureGate from "@/components/FeatureGate";
import type { Language, Specialty, ClinicalAnalysis, ImageDiagnosis, Patient } from "@/types/clinical";

interface Props {
  language: Language;
}

const NewConsultation = ({ language }: Props) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [specialty, setSpecialty] = useState<Specialty>("general");
  const [learningMode, setLearningMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ClinicalAnalysis | null>(null);
  const [lastSymptoms, setLastSymptoms] = useState("");
  const [lastNotes, setLastNotes] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consent, setConsent] = useState(false);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageDiagnosis, setImageDiagnosis] = useState<ImageDiagnosis | null>(null);

  const { isOnline, addToQueue, markSynced, queue } = useOfflineSync();
  const trial = useTrialStatus();
  const locked = isFeatureLocked(trial);

  // Preselect patient from URL param
  useEffect(() => {
    const patientId = searchParams.get("patient");
    if (patientId) {
      supabase.from("patients").select("*").eq("id", patientId).single().then(({ data }) => {
        if (data) setSelectedPatient(data as unknown as Patient);
      });
    }
  }, [searchParams]);

  const saveConsultation = async (symptoms: string, notes: string, result: ClinicalAnalysis, mode = "text") => {
    if (!consent) {
      toast({ title: "Consent Required", description: "Please confirm patient consent before saving.", variant: "destructive" });
      return;
    }
    if (!selectedPatient) {
      toast({ title: "Patient Required", description: "Please select or create a patient before saving.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("consultations").insert({
      user_id: user!.id,
      symptoms,
      notes,
      language,
      analysis: result as any,
      patient_id: selectedPatient.id,
      mode,
    });
    if (error) {
      console.error("Failed to save:", error);
      toast({ title: "Save Failed", description: "Could not save consultation. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: `Consultation saved for ${selectedPatient.name}.` });
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
      toast({ title: "Analysis Failed", description: "Could not connect to AI engine.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [language, specialty, learningMode, user, selectedPatient, consent]);

  const handleSubmit = useCallback(async (symptoms: string, notes: string) => {
    if (!selectedPatient) {
      toast({ title: "Patient Required", description: "Please select or create a patient first.", variant: "destructive" });
      return;
    }
    if (!consent) {
      toast({ title: "Consent Required", description: "Please confirm patient consent.", variant: "destructive" });
      return;
    }
    if (!isOnline) {
      addToQueue(symptoms, notes, language, specialty);
      toast({ title: "Saved Offline", description: "Will be analyzed when back online." });
      return;
    }
    runAnalysis(symptoms, notes);
  }, [isOnline, language, specialty, runAnalysis, addToQueue, selectedPatient, consent]);

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
      toast({ title: "Image Analysis Failed", description: "Could not analyze. Try again.", variant: "destructive" });
    } finally {
      setIsImageLoading(false);
    }
  }, [language]);

  return (
    <div className="container px-4 py-4 md:py-6 space-y-4">
      <TrialBanner trial={trial} />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          <span>AI-assisted decision support tool only.</span>
        </div>
        <SpecialtySelector value={specialty} onChange={setSpecialty} />
      </div>

      <div className="glass-card p-4 space-y-3">
        <PatientSelector selectedPatient={selectedPatient} onSelect={setSelectedPatient} />
        <ConsentCheckbox checked={consent} onChange={setConsent} />
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="text" className="gap-1.5">
            <Stethoscope className="h-3.5 w-3.5" /> Symptoms
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Image Dx
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <ConsultationInput onSubmit={handleSubmit} isLoading={isLoading} language={language} />
              {analysis && <RiskScoreBadge score={analysis.risk_score} level={analysis.emergency_level} />}
              <LearningMode enabled={learningMode} onToggle={setLearningMode} analysis={analysis} />
              {analysis && <ConsultationSummary symptoms={lastSymptoms} notes={lastNotes} analysis={analysis} />}
            </div>
            <div className="lg:col-span-3">
              <AISuggestionsPanel analysis={analysis} reasoningLocked={locked} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          {locked ? (
            <FeatureGate featureName="Image Diagnosis" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <ImageUpload onSubmit={handleImageSubmit} isLoading={isImageLoading} language={language} />
              </div>
              <div className="lg:col-span-3">
                <ImageDiagnosisPanel diagnosis={imageDiagnosis} />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewConsultation;
