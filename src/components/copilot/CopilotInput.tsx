import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Loader2, Brain, RotateCcw } from "lucide-react";
import VoiceDictationButton from "@/components/VoiceDictationButton";

interface Props {
  onSubmit: (data: { symptoms: string; age?: string; gender?: string; temp?: string; spo2?: string }) => void;
  isLoading: boolean;
  onReset?: () => void;
}

const CopilotInput = ({ onSubmit, isLoading, onReset }: Props) => {
  const [symptoms, setSymptoms] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [temp, setTemp] = useState("");
  const [spo2, setSpo2] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    onSubmit({
      symptoms: symptoms.trim(),
      ...(age && { age }),
      ...(gender && { gender }),
      ...(temp && { temp }),
      ...(spo2 && { spo2 }),
    });
  };

  const handleReset = () => {
    setSymptoms("");
    setAge("");
    setGender("");
    setTemp("");
    setSpo2("");
    setShowOptional(false);
    onReset?.();
  };

  const hasAny = symptoms || age || gender || temp || spo2;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">OPD Copilot</h3>
              <p className="text-[10px] text-muted-foreground">AI-powered clinical decision support</p>
            </div>
          </div>

          <div className="relative">
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. fever 3 din se, cough, diabetic"
              className="min-h-[80px] text-sm resize-none pr-12"
              maxLength={2000}
            />
            <div className="absolute top-2 right-2">
              <VoiceDictationButton
                language="en"
                size="sm"
                disabled={isLoading}
                onCommit={(t) =>
                  setSymptoms((prev) => (prev ? prev.replace(/\s+$/, "") + " " + t : t))
                }
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showOptional ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Optional: Age, Gender, Vitals
          </button>

          {showOptional && (
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="h-8 text-xs" />
              <Input placeholder="Gender (M/F)" value={gender} onChange={(e) => setGender(e.target.value)} className="h-8 text-xs" />
              <Input placeholder="Temp (°F)" value={temp} onChange={(e) => setTemp(e.target.value)} className="h-8 text-xs" />
              <Input placeholder="SpO2 (%)" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="h-8 text-xs" />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || !symptoms.trim()} className="flex-1 h-9 text-sm">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing…
                </>
              ) : (
                "Run Copilot"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={handleReset}
              disabled={isLoading || !hasAny}
              title="Reset"
              aria-label="Reset inputs"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CopilotInput;
