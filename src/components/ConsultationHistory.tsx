import { useState, useEffect } from "react";
import { History, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { ClinicalAnalysis } from "@/types/clinical";

interface Consultation {
  id: string;
  symptoms: string;
  notes: string;
  language: string;
  analysis: ClinicalAnalysis;
  created_at: string;
}

interface ConsultationHistoryProps {
  onSelect: (c: Consultation) => void;
  refreshKey: number;
}

const ConsultationHistory = ({ onSelect, refreshKey }: ConsultationHistoryProps) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setConsultations(data as unknown as Consultation[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshKey]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("consultations").delete().eq("id", id);
    setConsultations((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <History className="h-4 w-4 animate-spin" />
          Loading history...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">
            Past Consultations ({consultations.length})
          </h3>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {consultations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No consultations yet. Analyze a case to save it here.
            </p>
          ) : (
            consultations.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className="flex items-start justify-between gap-2 p-2.5 rounded-md bg-muted/40 hover:bg-muted/70 cursor-pointer transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">{c.symptoms}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(c.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {((c.analysis as any).differentials || (c.analysis as any).differential_diagnosis || []).length} diagnoses
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => handleDelete(c.id, e)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultationHistory;
