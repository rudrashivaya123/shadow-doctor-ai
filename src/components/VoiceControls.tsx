import { Volume2, Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech, isSpeechSynthesisSupported } from "@/hooks/useVoice";
import { useEffect, useRef } from "react";

interface VoiceControlsProps {
  text: string;
  language?: string;
  autoPlay?: boolean;
  className?: string;
  label?: string;
}

/**
 * Voice controls (Speak / Stop / Pause / Resume) for any AI response text.
 * Optionally auto-plays once when text changes.
 */
const VoiceControls = ({
  text,
  language = "en",
  autoPlay = false,
  className = "",
  label = "Listen",
}: VoiceControlsProps) => {
  const { speak, stop, pause, resume, isSpeaking, isPaused, supported } = useTextToSpeech(language);
  const lastAutoPlayedRef = useRef<string>("");

  useEffect(() => {
    if (!autoPlay || !supported) return;
    const t = text?.trim();
    if (!t || lastAutoPlayedRef.current === t) return;
    lastAutoPlayedRef.current = t;
    // Small delay to let UI settle
    const id = setTimeout(() => speak(t), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay, supported]);

  if (!isSpeechSynthesisSupported()) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {!isSpeaking && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => speak(text)}
          disabled={!text?.trim()}
          aria-label={label}
        >
          <Volume2 className="h-3.5 w-3.5" />
          {label}
        </Button>
      )}
      {isSpeaking && !isPaused && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={pause}
          aria-label="Pause"
        >
          <Pause className="h-3.5 w-3.5" />
          Pause
        </Button>
      )}
      {isSpeaking && isPaused && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={resume}
          aria-label="Resume"
        >
          <Play className="h-3.5 w-3.5" />
          Resume
        </Button>
      )}
      {isSpeaking && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs border-destructive/40 text-destructive hover:text-destructive"
          onClick={stop}
          aria-label="Stop speaking"
        >
          <Square className="h-3.5 w-3.5" />
          Stop
        </Button>
      )}
      {isSpeaking && (
        <span className="flex items-center gap-1 text-[10px] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Speaking…
        </span>
      )}
    </div>
  );
};

export default VoiceControls;
