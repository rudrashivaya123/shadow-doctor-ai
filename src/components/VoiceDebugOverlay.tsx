import { useEffect, useState } from "react";
import { Bug, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  subscribeVoiceDebug,
  getVoiceDebugBuffer,
  clearVoiceDebug,
  type VoiceDebugEvent,
} from "@/lib/voiceDebugBus";
import { cn } from "@/lib/utils";

/**
 * On-screen overlay for voice dictation debugging on real devices.
 * Floating bug button → expands to a scrollable log of [voice] events.
 * Useful when DevTools isn't available (Android, in-app browsers).
 */
const VoiceDebugOverlay = () => {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<VoiceDebugEvent[]>(() =>
    getVoiceDebugBuffer()
  );

  useEffect(() => {
    const unsub = subscribeVoiceDebug(() => {
      setEvents(getVoiceDebugBuffer());
    });
    return unsub;
  }, []);

  const levelColor = (l: VoiceDebugEvent["level"]) =>
    l === "error"
      ? "text-destructive"
      : l === "warn"
        ? "text-warning"
        : "text-muted-foreground";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-3 z-[60] h-10 w-10 rounded-full bg-card border border-border/60 shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all"
        aria-label="Open voice debug"
        title="Voice debug"
      >
        <Bug className="h-4 w-4" />
        {events.length > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center px-1">
            {events.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-3 z-[60] w-[min(92vw,360px)] max-h-[60vh] rounded-xl bg-card border border-border/60 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Voice debug</span>
          <span className="text-[10px] text-muted-foreground">
            {events.length} events
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              clearVoiceDebug();
              setEvents([]);
            }}
            title="Clear"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setOpen(false)}
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1 font-mono text-[10px] leading-tight">
        {events.length === 0 && (
          <div className="text-muted-foreground italic px-1 py-2">
            No events yet. Tap the mic to start dictation.
          </div>
        )}
        {events.map((e, i) => (
          <div key={i} className="flex gap-1.5">
            <span className="text-muted-foreground/60 shrink-0">
              {new Date(e.ts).toLocaleTimeString("en-GB", { hour12: false })}
            </span>
            <span className={cn("font-semibold shrink-0", levelColor(e.level))}>
              {e.msg}
            </span>
            {e.data !== undefined && (
              <span className="text-foreground/70 break-all">
                {typeof e.data === "string"
                  ? e.data
                  : JSON.stringify(e.data)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceDebugOverlay;
