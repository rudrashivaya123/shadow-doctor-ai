import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PatientForm from "@/components/PatientForm";
import type { Patient } from "@/types/clinical";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import { useDemoUser } from "@/hooks/useDemoUser";

const FREE_PATIENT_LIMIT = 10;

const Patients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const trial = useTrialStatus();
  const locked = isFeatureLocked(trial);
  const { isDemoUser } = useDemoUser();
  const [patients, setPatients] = useState<(Patient & { last_visit?: string })[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch last consultation date for each patient
      const patientsWithVisits = await Promise.all(
        (data as unknown as Patient[]).map(async (p) => {
          const { data: consult } = await supabase
            .from("consultations")
            .select("created_at")
            .eq("patient_id", p.id)
            .order("created_at", { ascending: false })
            .limit(1);
          return { ...p, last_visit: consult?.[0]?.created_at || p.created_at };
        })
      );
      setPatients(patientsWithVisits);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDemoUser) {
      toast({ title: "Restricted", description: "Demo users cannot delete patient data.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (!error) {
      setPatients((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Patient Deleted", description: "Patient data has been removed." });
    }
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const canAddPatient = trial.isPremium || trial.isTrialActive || patients.length < FREE_PATIENT_LIMIT;

  return (
    <div className="container px-4 py-4 md:py-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Patients</h2>
          <span className="text-sm text-muted-foreground">({patients.length})</span>
        </div>
        <Button onClick={() => setShowForm(!showForm)} disabled={!canAddPatient} className="gap-1.5" size="sm">
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      {!canAddPatient && (
        <div className="text-xs text-warning p-2 rounded bg-warning/10 border border-warning/30">
          Free tier limited to {FREE_PATIENT_LIMIT} patients. Upgrade for unlimited.
        </div>
      )}

      {showForm && (
        <PatientForm
          onSuccess={(p) => { fetchPatients(); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading patients...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {search ? "No patients match your search." : "No patients yet. Add your first patient above."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/patients/${p.id}`)}
              className="glass-card p-4 cursor-pointer hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.age ? `${p.age}y` : "Age N/A"} · {p.gender || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last visit: {new Date(p.last_visit || p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => handleDelete(p.id, e)}
                  title="Delete patient data"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Patients;
