import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, Search, Filter, Calendar, AlertTriangle, Image as ImageIcon, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { ClinicalAnalysis } from "@/types/clinical";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import FeatureGate from "@/components/FeatureGate";

const FREE_HISTORY_LIMIT = 3;

interface HistoryRecord {
  id: string;
  symptoms: string;
  notes: string | null;
  analysis: ClinicalAnalysis;
  created_at: string;
  mode: string;
  patient_id: string | null;
  patient_name?: string;
}

const HistoryPage = () => {
  const navigate = useNavigate();
  const trial = useTrialStatus();
  const locked = isFeatureLocked(trial);
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        // Fetch patient names
        const patientIds = [...new Set(data.filter((c: any) => c.patient_id).map((c: any) => c.patient_id))];
        let patientMap: Record<string, string> = {};
        if (patientIds.length > 0) {
          const { data: patients } = await supabase.from("patients").select("id, name").in("id", patientIds);
          if (patients) {
            patientMap = Object.fromEntries(patients.map((p: any) => [p.id, p.name]));
          }
        }

        setRecords(
          (data as any[]).map((c) => ({
            ...c,
            analysis: c.analysis as ClinicalAnalysis,
            patient_name: c.patient_id ? patientMap[c.patient_id] || "Unknown" : undefined,
          }))
        );
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = records.filter((r) => {
    const matchSearch = !search ||
      r.symptoms.toLowerCase().includes(search.toLowerCase()) ||
      r.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.analysis?.primary_diagnosis?.toLowerCase().includes(search.toLowerCase());
    const matchUrgency = urgencyFilter === "all" || r.analysis?.emergency_level === urgencyFilter;
    const matchMode = modeFilter === "all" || r.mode === modeFilter;
    return matchSearch && matchUrgency && matchMode;
  });

  const displayRecords = !trial.isPremium && !trial.isTrialActive
    ? filtered.slice(0, FREE_HISTORY_LIMIT)
    : filtered;

  const emergencyColor = (level: string) => {
    if (level === "HIGH RISK") return "destructive" as const;
    if (level === "Moderate") return "secondary" as const;
    return "secondary" as const;
  };

  return (
    <div className="container px-4 py-4 md:py-6 space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Consultation History</h2>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient, symptoms, diagnosis..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Moderate">Moderate</SelectItem>
            <SelectItem value="HIGH RISK">High Risk</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading history...</p>
      ) : displayRecords.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No consultations found.</p>
      ) : (
        <div className="space-y-2">
          {displayRecords.map((r) => (
            <div
              key={r.id}
              onClick={() => navigate(`/consultation/${r.id}`)}
              className="glass-card p-3 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {r.patient_name && <span className="text-xs font-semibold text-primary">{r.patient_name}</span>}
                    {r.mode === "image" ? <ImageIcon className="h-3 w-3 text-muted-foreground" /> : <FileText className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-foreground truncate mt-0.5">{r.symptoms}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {r.analysis?.primary_diagnosis && ` · Dx: ${r.analysis.primary_diagnosis.slice(0, 50)}`}
                  </p>
                </div>
                <Badge variant={emergencyColor(r.analysis?.emergency_level || "Low")} className="text-[10px] shrink-0">
                  {r.analysis?.emergency_level || "Low"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {!trial.isPremium && !trial.isTrialActive && filtered.length > FREE_HISTORY_LIMIT && (
        <div className="pt-2">
          <FeatureGate featureName="Full History" />
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
