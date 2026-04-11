import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  History, Search, Filter, Image as ImageIcon, FileText,
  Bookmark, Trash2, CheckSquare, MoreVertical, X, AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import type { ClinicalAnalysis } from "@/types/clinical";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import FeatureGate from "@/components/FeatureGate";
import { toast } from "sonner";

const FREE_HISTORY_LIMIT = 3;
const SAVED_KEY = "shadowmd_saved_consultations";

const getSavedIds = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"));
  } catch {
    return new Set();
  }
};
const persistSavedIds = (ids: Set<string>) => {
  localStorage.setItem(SAVED_KEY, JSON.stringify([...ids]));
};

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
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  // Selection state
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Saved/bookmarked
  const [savedIds, setSavedIds] = useState<Set<string>>(getSavedIds);

  // Delete dialogs
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [clearAllOpen, setClearAllOpen] = useState(false);

  // Undo state
  const undoRef = useRef<{ ids: string[]; records: HistoryRecord[] } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
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
    load();
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
    return "secondary" as const;
  };

  // --- Actions ---

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast("Bookmark removed");
      } else {
        next.add(id);
        toast.success("Consultation saved");
      }
      persistSavedIds(next);
      return next;
    });
  };

  const deleteRecords = async (ids: string[]) => {
    const removed = records.filter((r) => ids.includes(r.id));
    undoRef.current = { ids, records: removed };

    setRecords((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelected(new Set());
    setSelectMode(false);

    // Delete from DB
    for (const id of ids) {
      await supabase.from("consultations").delete().eq("id", id);
    }

    toast("Consultation deleted", {
      action: {
        label: "Undo",
        onClick: () => handleUndo(),
      },
      duration: 5000,
    });
  };

  const handleUndo = useCallback(async () => {
    if (!undoRef.current) return;
    const { records: removed } = undoRef.current;
    // Re-insert into DB
    for (const r of removed) {
      await supabase.from("consultations").insert({
        id: r.id,
        symptoms: r.symptoms,
        notes: r.notes,
        language: "en",
        analysis: r.analysis as any,
        created_at: r.created_at,
        patient_id: r.patient_id,
        mode: r.mode,
        user_id: (r as any).user_id,
      });
    }
    setRecords((prev) => [...removed, ...prev].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
    undoRef.current = null;
    toast.success("Consultation restored");
  }, []);

  const clearAll = async () => {
    const allIds = records.map((r) => r.id);
    undoRef.current = { ids: allIds, records: [...records] };
    setRecords([]);
    for (const id of allIds) {
      await supabase.from("consultations").delete().eq("id", id);
    }
    toast("All history cleared", {
      action: { label: "Undo", onClick: () => handleUndo() },
      duration: 5000,
    });
  };

  const bulkSave = () => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      selected.forEach((id) => next.add(id));
      persistSavedIds(next);
      return next;
    });
    toast.success(`${selected.size} consultations saved`);
    setSelected(new Set());
    setSelectMode(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- Swipe support ---
  const touchRef = useRef<{ id: string; startX: number } | null>(null);

  const handleTouchStart = (id: string, e: React.TouchEvent) => {
    touchRef.current = { id, startX: e.touches[0].clientX };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.startX;
    const id = touchRef.current.id;
    touchRef.current = null;
    if (dx > 80) {
      // Swipe right → save
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        persistSavedIds(next);
        return next;
      });
      toast.success("Consultation saved");
    } else if (dx < -80) {
      // Swipe left → delete
      setDeleteTarget(id);
    }
  };

  return (
    <div className="container px-4 py-4 md:py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Consultation History</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={selectMode ? "default" : "outline"}
            size="sm"
            onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
            className="text-xs"
          >
            <CheckSquare className="h-3.5 w-3.5 mr-1" />
            {selectMode ? "Cancel" : "Select"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setClearAllOpen(true)}
                disabled={records.length === 0}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Clear All History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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

      {/* Records */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Loading history...</p>
      ) : displayRecords.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No consultations found.</p>
      ) : (
        <div className="space-y-2 pb-20">
          {displayRecords.map((r) => {
            const isSaved = savedIds.has(r.id);
            const isSelected = selected.has(r.id);
            return (
              <div
                key={r.id}
                onTouchStart={(e) => handleTouchStart(r.id, e)}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                  if (selectMode) { toggleSelect(r.id); return; }
                  navigate(`/dashboard/consultation/${r.id}`);
                }}
                className={`glass-card p-3 cursor-pointer transition-colors ${
                  isSaved ? "border-primary/30 bg-primary/5" : "hover:border-primary/40"
                } ${isSelected ? "ring-2 ring-primary/50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  {selectMode && (
                    <div className="pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(r.id)}
                      />
                    </div>
                  )}
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
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={emergencyColor(r.analysis?.emergency_level || "Low")} className="text-[10px]">
                      {r.analysis?.emergency_level || "Low"}
                    </Badge>
                    {!selectMode && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => toggleSave(r.id, e)}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(r.id); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!trial.isPremium && !trial.isTrialActive && filtered.length > FREE_HISTORY_LIMIT && (
        <div className="pt-2">
          <FeatureGate featureName="Full History" />
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectMode && selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background border border-border rounded-lg shadow-lg px-4 py-2.5">
          <span className="text-sm font-medium text-foreground mr-2">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={bulkSave}>
            <Bookmark className="h-3.5 w-3.5 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      )}

      {/* Single Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete consultation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this consultation? You can undo this action briefly after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) deleteRecords([deleteTarget]); setDeleteTarget(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} consultations?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone permanently. You'll have a brief window to undo after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { deleteRecords([...selected]); setBulkDeleteOpen(false); }}
            >
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Dialog */}
      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Clear All History
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL your consultation history. This is a destructive action. Are you absolutely sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { clearAll(); setClearAllOpen(false); }}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HistoryPage;
