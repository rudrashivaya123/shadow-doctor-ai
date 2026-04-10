import { useState } from "react";
import { Zap, User, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  onSubmit: (data: { symptoms: string; age?: string; gender?: string; vitals?: string }) => void;
  isLoading: boolean;
}

const EviSmartInput = ({ onSubmit, isLoading }: Props) => {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [vitals, setVitals] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    onSubmit({ symptoms: symptoms.trim(), age: age || undefined, gender: gender || undefined, vitals: vitals || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">EviSmart</h3>
          <p className="text-[10px] text-muted-foreground">Rapid evidence-based decision support</p>
        </div>
      </div>

      <Textarea
        placeholder="Type symptoms... (Hinglish OK) e.g. 'bukhar 3 din, dry cough, no appetite'"
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="min-h-[70px] text-sm resize-none"
        maxLength={2000}
      />

      {!showOptional && (
        <button
          type="button"
          onClick={() => setShowOptional(true)}
          className="text-xs text-primary hover:underline"
        >
          + Add age, gender, vitals (optional)
        </button>
      )}

      {showOptional && (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> Age
            </label>
            <Input
              placeholder="e.g. 45"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-8 text-xs"
              maxLength={3}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground">Gender</label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="child">Child</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> Vitals
            </label>
            <Input
              placeholder="BP, SpO2…"
              value={vitals}
              onChange={(e) => setVitals(e.target.value)}
              className="h-8 text-xs"
              maxLength={200}
            />
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading || !symptoms.trim()} className="w-full gap-2">
        <Zap className="h-4 w-4" />
        {isLoading ? "Analyzing…" : "Get EviSmart Advice"}
      </Button>
    </form>
  );
};

export default EviSmartInput;
