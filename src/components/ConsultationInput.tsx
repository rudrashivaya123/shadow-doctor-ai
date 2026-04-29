import { useState, useRef } from "react";
import { Mic, MicOff, Send, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTypingSuggestions } from "@/hooks/useTypingSuggestions";
import { useSpeechToText } from "@/hooks/useVoice";
import { useToast } from "@/hooks/use-toast";
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

const speechLocale: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  mr: "mr-IN",
};

const categoryColor: Record<string, string> = {
  symptom: "bg-primary/20 text-primary border-primary/30",
  condition: "bg-warning/20 text-warning border-warning/30",
  test: "bg-success/20 text-success border-success/30",
};

const ConsultationInput = ({ onSubmit, isLoading, language, onReset }: ConsultationInputProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const baseSymptomsRef = useRef("");
  const { toast } = useToast();

  const suggestions = useTypingSuggestions(symptoms);

  const { isListening, supported: sttSupported, toggle: toggleMic, error: sttError } =
    useSpeechToText(language, (text) => {
      const base = baseSymptomsRef.current;
      setSymptoms(base ? `${base} ${text}`.trim() : text);
    });

  // Surface mic errors via toast
  if (sttError) {
    // fire-and-forget; toast dedup handled by sonner
    setTimeout(() => toast({ title: "Microphone", description: sttError, variant: "destructive" }), 0);
  }

  const handleSubmit = () => {
    if (!symptoms.trim()) return;
    onSubmit(symptoms, notes);
  };

  const handleReset = () => {
    setSymptoms("");
    setNotes("");
    baseSymptomsRef.current = "";
    onReset?.();
  };

  const applySuggestion = (text: string) => {
    const words = symptoms.split(/[\s,]+/);
    words[words.length - 1] = text;
    setSymptoms(words.join(", ") + ", ");
  };

  const handleMicClick = () => {
    if (!sttSupported) {
      toast({
        title: "Not supported",
        description: "Voice input is not available in this browser.",
        variant: "destructive",
      });
      return;
    }
    if (!isListening) baseSymptomsRef.current = symptoms;
    toggleMic();
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
          <Button
            variant="outline"
            size="icon"
            onClick={handleMicClick}
            title={isListening ? "Stop listening" : "Start voice input"}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            className={isListening ? "border-destructive text-destructive animate-pulse-slow" : ""}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-slow" />
          Listening...
        </div>
      )}

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

      <Textarea
        placeholder={ph.notes}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[80px] bg-muted/50 border-border/60 resize-none"
      />

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
