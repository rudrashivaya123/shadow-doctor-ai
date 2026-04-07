import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Patient } from "@/types/clinical";
import PatientForm from "./PatientForm";

interface PatientSelectorProps {
  selectedPatient: Patient | null;
  onSelect: (p: Patient | null) => void;
}

const PatientSelector = ({ selectedPatient, onSelect }: PatientSelectorProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .order("name", { ascending: true });
    if (data) setPatients(data as unknown as Patient[]);
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleNewPatient = (p: any) => {
    const patient = p as Patient;
    setPatients((prev) => [...prev, patient].sort((a, b) => a.name.localeCompare(b.name)));
    onSelect(patient);
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Select Patient</span>
      </div>

      <div className="flex gap-2">
        <Select
          value={selectedPatient?.id || ""}
          onValueChange={(v) => {
            const p = patients.find((p) => p.id === v) || null;
            onSelect(p);
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose a patient..." />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} {p.age ? `(${p.age}y)` : ""} {p.gender ? `· ${p.gender}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => setShowForm(!showForm)} title="Add new patient">
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      {showForm && <PatientForm onSuccess={handleNewPatient} onCancel={() => setShowForm(false)} />}
    </div>
  );
};

export default PatientSelector;
