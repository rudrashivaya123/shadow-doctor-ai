import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Phone, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Patient, ClinicalAnalysis } from "@/types/clinical";

interface ConsultationRecord {
  id: string;
  symptoms: string;
  notes: string | null;
  analysis: ClinicalAnalysis;
  created_at: string;
  mode: string;
}

const PatientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const [pRes, cRes] = await Promise.all([
        supabase.from("patients").select("*").eq("id", id).single(),
        supabase.from("consultations").select("*").eq("patient_id", id).order("created_at", { ascending: false }),
      ]);
      if (pRes.data) setPatient(pRes.data as unknown as Patient);
      if (cRes.data) setConsultations(cRes.data as unknown as ConsultationRecord[]);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!patient) return <div className="p-8 text-center text-muted-foreground">Patient not found.</div>;

  const emergencyColor = (level: string) => {
    if (level === "HIGH RISK") return "destructive" as const;
    if (level === "Moderate") return "secondary" as const;
    return "secondary" as const;
  };

  return (
    <div className="container px-4 py-4 md:py-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/patients")} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Back to Patients
      </Button>

      <div className="glass-card p-4 md:p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{patient.name}</h2>
            <p className="text-sm text-muted-foreground">
              {patient.age ? `${patient.age} years` : ""} {patient.gender ? `· ${patient.gender}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {patient.phone && (
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{patient.phone}</span>
          )}
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Registered: {new Date(patient.created_at).toLocaleDateString("en-IN")}</span>
        </div>
        <p className="text-xs text-muted-foreground">Patient ID: {patient.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          Consultation History ({consultations.length})
        </h3>

        {consultations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No consultations recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {consultations.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/consultation/${c.id}`)}
                className="glass-card p-3 cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{c.symptoms}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {" · "}{c.mode === "image" ? "Image Dx" : "Text"}
                    </p>
                  </div>
                  <Badge variant={emergencyColor(c.analysis?.emergency_level || "Low")} className="text-[10px] shrink-0">
                    {c.analysis?.emergency_level || "Low"}
                  </Badge>
                </div>
                {c.analysis?.primary_diagnosis && (
                  <p className="text-xs text-primary mt-1 truncate">Dx: {c.analysis.primary_diagnosis}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={() => navigate(`/consultation?patient=${patient.id}`)} className="gap-2">
        <Stethoscope className="h-4 w-4" />
        New Consultation for {patient.name}
      </Button>
    </div>
  );
};

export default PatientProfile;
