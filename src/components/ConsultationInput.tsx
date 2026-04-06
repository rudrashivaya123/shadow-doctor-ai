import { useState } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Language } from "@/types/clinical";

interface ConsultationInputProps {
  onSubmit: (symptoms: string, notes: string) => void;
  isLoading: boolean;
  language: Language;
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
  mr: {
    symptoms: "रुग्णाची लक्षणे प्रविष्ट करा... (उदा., ३ दिवसांपासून ताप, डोकेदुखी)",
    notes: "डॉक्टरांच्या नोट्स (पर्यायी)...",
  },
};

const ConsultationInput = ({ onSubmit, isLoading, language }: ConsultationInputProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = () => {
    if (!symptoms.trim()) return;
    onSubmit(symptoms, notes);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Voice recording placeholder - would use Web Speech API
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSymptoms((prev) => (prev ? prev + " " + transcript : transcript));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } else {
        setTimeout(() => setIsRecording(false), 2000);
      }
    }
  };

  const ph = placeholders[language];

  return (
    <div className="glass-card p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Patient Input</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleRecording}
          className={isRecording ? "border-destructive text-destructive animate-pulse-slow" : ""}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <span className="h-2 w-2 rounded-full bg-destructive animate-pulse-slow" />
          Listening...
        </div>
      )}

      <Textarea
        placeholder={ph.symptoms}
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="min-h-[120px] bg-muted/50 border-border/60 resize-none"
      />

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
