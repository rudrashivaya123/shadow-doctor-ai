import { useState } from "react";
import { Send, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTypingSuggestions } from "@/hooks/useTypingSuggestions";
import VoiceDictationButton from "@/components/VoiceDictationButton";
import type { Language } from "@/types/clinical";

interface ConsultationInputProps {
  onSubmit: (symptoms: string, notes: string) => void;
  isLoading: boolean;
  language: Language;
  onReset?: () => void;
}

const placeholders: Record<Language, { symptoms: string; notes: string }> = {
  en: {
    symptoms: "Enter patient symptoms... (e.g., fever for 3 days, headache, body aches)",
    notes: "Doctor's notes (optional)... (e.g., no history of travel, BP normal)",
  },
  hi: {
    symptoms: "रोगी के लक्षण दर्ज करें... (जैसे, 3 दिन से बुखार, सिरदर्द)",
    notes: "डॉक्टर के नोट्स (वैकल्पिक)...",
  },
  ta: {
    symptoms: "நோயாளியின் அறிகுறிகளை உள்ளிடவும்... (எ.கா., 3 நாட்கள் காய்ச்சல், தலைவலி)",
    notes: "மருத்துவரின் குறிப்புகள் (விருப்பம்)...",
  },
  te: {
    symptoms: "రోగి లక్షణాలను నమోదు చేయండి... (ఉదా., 3 రోజులుగా జ్వరం, తలనొప్పి)",
    notes: "డాక్టర్ గమనికలు (ఐచ్ఛికం)...",
  },
  bn: {
    symptoms: "রোগীর উপসর্গ লিখুন... (যেমন, ৩ দিন ধরে জ্বর, মাথাব্যথা)",
    notes: "ডাক্তারের নোট (ঐচ্ছিক)...",
  },
  mr: {
    symptoms: "रुग्णाची लक्षणे प्रविष्ट करा... (उदा., 3 दिवसांपासून ताप, डोकेदुखी)",
    notes: "डॉक्टरांच्या नोंदी (पर्यायी)...",
  },
};

const categoryColor: Record<string, string> = {
  symptom: "bg-primary/20 text-primary border-primary/30",
  condition: "bg-warning/20 text-warning border-warning/30",
  test: "bg-success/20 text-success border-success/30",
};

const ConsultationInput = ({ onSubmit, isLoading, language, onReset }: ConsultationInputProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");

  const suggestions = useTypingSuggestions(symptoms);

  const handleSubmit = () => {
    if (!symptoms.trim()) return;
    onSubmit(symptoms, notes);
  };

  const handleReset = () => {
    setSymptoms("");
    setNotes("");
    onReset?.();
  };

  const applySuggestion = (text: string) => {
    const words = symptoms.split(/[\s,]+/);
    words[words.length - 1] = text;
    setSymptoms(words.join(", ") + ", ");
  };

  const appendDictation = (target: "symptoms" | "notes", text: string) => {
    if (target === "symptoms") {
      setSymptoms((prev) => (prev ? prev.replace(/\s+$/, "") + " " + text : text));
    } else {
      setNotes((prev) => (prev ? prev.replace(/\s+$/, "") + " " + text : text));
    }
  };

  const ph = placeholders[language];

  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Patient Input</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={isLoading || (!symptoms && !notes)}
            title="Reset"
            aria-label="Reset inputs"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <VoiceDictationButton
            language={language}
            onCommit={(t) => appendDictation("symptoms", t)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="relative">
        <Textarea
          placeholder={ph.symptoms}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className="min-h-[120px] bg-muted/50 border-border/60 resize-none"
        />
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {suggestions.map((s) => (
              <Badge
                key={s.text}
                variant="outline"
                className={`${categoryColor[s.category]} cursor-pointer text-[10px] hover:scale-105 transition-transform`}
                onClick={() => applySuggestion(s.text)}
              >
                {s.text}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <Textarea
          placeholder={ph.notes}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[80px] bg-muted/50 border-border/60 resize-none pr-12"
        />
        <div className="absolute top-2 right-2">
          <VoiceDictationButton
            language={language}
            onCommit={(t) => appendDictation("notes", t)}
            disabled={isLoading}
            showInterim={false}
            size="sm"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!symptoms.trim() || isLoading}
        className="w-full gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Analyze Consultation
          </>
        )}
      </Button>
    </div>
  );
};

export default ConsultationInput;
