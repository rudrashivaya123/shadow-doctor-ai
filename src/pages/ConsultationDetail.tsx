import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import AISuggestionsPanel from "@/components/AISuggestionsPanel";
import ConsultationSummary from "@/components/ConsultationSummary";
import RiskScoreBadge from "@/components/RiskScoreBadge";
import LearningMode from "@/components/LearningMode";
import type { ClinicalAnalysis, Patient } from "@/types/clinical";

const ConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<any>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [learningMode, setLearningMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const { data } = await supabase.from("consultations").select("*").eq("id", id).single();
      if (data) {
        setConsultation(data);
        if (data.patient_id) {
          const { data: p } = await supabase.from("patients").select("*").eq("id", data.patient_id).single();
          if (p) setPatient(p as unknown as Patient);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!consultation) return <div className="p-8 text-center text-muted-foreground">Consultation not found.</div>;

  const analysis = consultation.analysis as ClinicalAnalysis;

  return (
    <div className="container px-4 py-4 md:py-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {patient && (
        <div className="glass-card p-3 flex items-center gap-3 cursor-pointer hover:border-primary/40"
          onClick={() => navigate(`/patients/${patient.id}`)}
        >
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{patient.name}</p>
            <p className="text-xs text-muted-foreground">
              {patient.age ? `${patient.age}y` : ""} {patient.gender ? `· ${patient.gender}` : ""}
            </p>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {new Date(consultation.created_at).toLocaleString("en-IN")}
        {" · "}{consultation.mode === "image" ? "Image Dx" : "Text Analysis"}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {analysis && <RiskScoreBadge score={analysis.risk_score} level={analysis.emergency_level} />}
          <LearningMode enabled={learningMode} onToggle={setLearningMode} analysis={analysis} />
          <ConsultationSummary symptoms={consultation.symptoms} notes={consultation.notes || ""} analysis={analysis} />
        </div>
        <div className="lg:col-span-3">
          <AISuggestionsPanel analysis={analysis} />
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetail;
