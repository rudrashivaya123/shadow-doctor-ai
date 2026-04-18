import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import type { Language } from "@/types/clinical";
import { cn } from "@/lib/utils";

interface Props {
  language: Language;
  /** Called with each finalized chunk — append to your input value */
  onCommit: (text: string) => void;
  /** Show live partial transcript below the button */
  showInterim?: boolean;
  /** Tailwind size: "sm" (36px) | "icon" (40px) */
  size?: "sm" | "icon";
  className?: string;
  disabled?: boolean;
  /** ms of silence before auto-stop. Default 2000 — captures natural pauses. */
  silenceTimeoutMs?: number;
}

const VoiceDictationButton = ({
  language,
  onCommit,
  showInterim = true,
  size = "icon",
  className,
  disabled,
  silenceTimeoutMs,
}: Props) => {
  const { toast } = useToast();
  const { status, interim, level, toggle, isSupported } = useVoiceDictation({
    language,
    silenceTimeoutMs,
    onCommit,
    onError: (msg) =>
      toast({ title: "Voice input", description: msg, variant: "destructive" }),
  });

  if (!isSupported) return null;

  const isActive = status === "listening" || status === "starting";
  const label =
    status === "starting"
      ? "Starting…"
      : status === "listening"
        ? "Listening…"
        : status === "processing"
          ? "Processing…"
          : "Tap to speak";

  return (
    <div className={cn("inline-flex flex-col items-end gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={toggle}
        disabled={disabled}
        title={label}
        aria-label={label}
        aria-pressed={isActive}
        className={cn(
          "relative transition-all",
          isActive && "border-destructive text-destructive"
        )}
      >
        {status === "starting" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isActive ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {isActive && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-md ring-2 ring-destructive/40 pointer-events-none"
            style={{
              transform: `scale(${1 + level * 0.25})`,
              opacity: 0.4 + level * 0.6,
              transition: "transform 80ms linear, opacity 80ms linear",
            }}
          />
        )}
      </Button>
      {showInterim && isActive && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          <span>{label}</span>
        </div>
      )}
      {showInterim && interim && (
        <div className="text-[11px] text-muted-foreground italic max-w-[220px] truncate">
          “{interim}”
        </div>
      )}
    </div>
  );
};

export default VoiceDictationButton;
