import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/types/clinical";
import { emitVoiceDebug } from "@/lib/voiceDebugBus";

/**
 * Clinical-grade voice dictation hook.
 *
 * v3 fixes (after persistent "mic on, no text" reports):
 *  - REMOVED the parallel getUserMedia()/AudioContext analyser entirely.
 *    On many Android Chromium builds, holding ANY second mic stream while
 *    SpeechRecognition is active causes the recognizer to receive silence and
 *    never emit `onresult`. Visualizer level is now driven from recognizer
 *    timing only.
 *  - Every event broadcasts to a global debug bus so the on-screen overlay
 *    can show what's happening on real devices without DevTools.
 *  - onCommit / onError stored in refs to dodge stale closures.
 *  - 8s no-result watchdog surfaces a clear error instead of silent failure.
 *  - Auto-restart on "no-speech" / "aborted" / "network" / "audio-capture".
 */

const speechLocale: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  mr: "mr-IN",
};

export type DictationStatus =
  | "idle"
  | "starting"
  | "listening"
  | "processing"
  | "error";

interface Options {
  language: Language;
  /** ms of silence before auto-stop (default 2500) — recognizer-driven */
  silenceTimeoutMs?: number;
  /** called when a final segment is committed; UI should append to its textarea */
  onCommit: (text: string) => void;
  /** unrecoverable error message */
  onError?: (msg: string) => void;
}

const RECOVERABLE_ERRORS = new Set([
  "no-speech",
  "aborted",
  "network",
  "audio-capture",
]);

export function useVoiceDictation({
  language,
  silenceTimeoutMs = 2500,
  onCommit,
  onError,
}: Options) {
  const [status, setStatus] = useState<DictationStatus>("idle");
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0);

  const onCommitRef = useRef(onCommit);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const recognitionRef = useRef<any>(null);
  const wantRunningRef = useRef(false);
  const restartAttemptsRef = useRef(0);
  const interimBufferRef = useRef("");
  const lastResultAtRef = useRef<number>(0);
  const noSpeechWatchdogRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const levelDecayRafRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (noSpeechWatchdogRef.current) {
      window.clearTimeout(noSpeechWatchdogRef.current);
      noSpeechWatchdogRef.current = null;
    }
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (levelDecayRafRef.current) {
      cancelAnimationFrame(levelDecayRafRef.current);
      levelDecayRafRef.current = null;
    }
  }, []);

  const stopInternal = useCallback(
    (commitInterim: boolean) => {
      emitVoiceDebug("info", "stop()", {
        commitInterim,
        hasInterim: !!interimBufferRef.current,
      });
      wantRunningRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        emitVoiceDebug("warn", "recognizer.stop() threw", String(e));
      }
      if (commitInterim && interimBufferRef.current.trim()) {
        try {
          onCommitRef.current?.(interimBufferRef.current.trim());
          emitVoiceDebug(
            "info",
            "committed interim on stop",
            interimBufferRef.current.trim()
          );
        } catch (e) {
          emitVoiceDebug("error", "onCommit threw on stop", String(e));
        }
      }
      interimBufferRef.current = "";
      setInterim("");
      clearTimers();
      setLevel(0);
      setStatus("idle");
    },
    [clearTimers]
  );

  const stop = useCallback(() => stopInternal(true), [stopInternal]);

  const pulseLevel = useCallback(() => {
    // Fake a level spike on each result so the visualizer pulses without
    // needing a parallel mic stream.
    setLevel(0.7);
    if (levelDecayRafRef.current) cancelAnimationFrame(levelDecayRafRef.current);
    const start = performance.now();
    const decay = (now: number) => {
      const t = (now - start) / 600;
      if (t >= 1) {
        setLevel(0);
        levelDecayRafRef.current = null;
        return;
      }
      setLevel(0.7 * (1 - t));
      levelDecayRafRef.current = requestAnimationFrame(decay);
    };
    levelDecayRafRef.current = requestAnimationFrame(decay);
  }, []);

  const startRecognition = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      emitVoiceDebug("error", "SpeechRecognition not in window");
      onErrorRef.current?.(
        "Voice input not supported in this browser. Try Chrome on Android or desktop."
      );
      setStatus("error");
      return;
    }
    const rec = new SR();
    rec.lang = speechLocale[language] || "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      emitVoiceDebug("info", "onstart", { lang: rec.lang });
      restartAttemptsRef.current = 0;
      lastResultAtRef.current = Date.now();
      setStatus("listening");

      if (noSpeechWatchdogRef.current)
        window.clearTimeout(noSpeechWatchdogRef.current);
      noSpeechWatchdogRef.current = window.setTimeout(() => {
        if (!wantRunningRef.current) return;
        const sinceLast = Date.now() - lastResultAtRef.current;
        if (sinceLast >= 8000) {
          emitVoiceDebug("warn", "watchdog: no result in 8s");
          onErrorRef.current?.(
            "No speech detected. Speak louder, or check the mic icon in the address bar."
          );
        }
      }, 8500);
    };

    rec.onaudiostart = () => emitVoiceDebug("info", "onaudiostart");
    rec.onsoundstart = () => emitVoiceDebug("info", "onsoundstart");
    rec.onspeechstart = () => emitVoiceDebug("info", "onspeechstart");
    rec.onspeechend = () => emitVoiceDebug("info", "onspeechend");
    rec.onsoundend = () => emitVoiceDebug("info", "onsoundend");
    rec.onaudioend = () => emitVoiceDebug("info", "onaudioend");
    rec.onnomatch = () => emitVoiceDebug("warn", "onnomatch");

    rec.onresult = (event: any) => {
      lastResultAtRef.current = Date.now();
      let interimChunk = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) finalChunk += txt + " ";
        else interimChunk += txt;
      }
      emitVoiceDebug("info", "onresult", {
        final: finalChunk.trim(),
        interim: interimChunk,
      });
      pulseLevel();

      if (finalChunk) {
        try {
          onCommitRef.current?.(finalChunk.trim());
          emitVoiceDebug("info", "→ committed", finalChunk.trim());
        } catch (e) {
          emitVoiceDebug("error", "onCommit threw", String(e));
        }
        interimBufferRef.current = "";
        setInterim("");
      }
      if (interimChunk) {
        interimBufferRef.current = interimChunk;
        setInterim(interimChunk);
      }

      // Recognizer-driven silence auto-stop (resets on every result).
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = window.setTimeout(() => {
        if (wantRunningRef.current) {
          emitVoiceDebug("info", "silence auto-stop");
          stopInternal(true);
        }
      }, silenceTimeoutMs);
    };

    rec.onerror = (e: any) => {
      const err = e?.error || "unknown";
      emitVoiceDebug("error", "onerror", err);
      if (err === "not-allowed" || err === "service-not-allowed") {
        onErrorRef.current?.(
          "Microphone permission denied. Tap the lock icon in the address bar → Site settings → Microphone → Allow."
        );
        wantRunningRef.current = false;
        clearTimers();
        setLevel(0);
        setStatus("error");
        return;
      }
      if (RECOVERABLE_ERRORS.has(err) && wantRunningRef.current) {
        // onend will restart.
        return;
      }
      onErrorRef.current?.(`Voice error: ${err}. Couldn't process voice.`);
      stopInternal(false);
      setStatus("error");
    };

    rec.onend = () => {
      emitVoiceDebug("info", "onend", {
        wantRunning: wantRunningRef.current,
        attempts: restartAttemptsRef.current,
      });
      if (wantRunningRef.current && restartAttemptsRef.current < 5) {
        restartAttemptsRef.current++;
        try {
          rec.start();
          emitVoiceDebug(
            "info",
            "restart",
            `attempt ${restartAttemptsRef.current}`
          );
        } catch (e) {
          emitVoiceDebug("error", "restart failed", String(e));
          stopInternal(true);
        }
      } else if (wantRunningRef.current) {
        emitVoiceDebug("warn", "max restart attempts hit");
        stopInternal(true);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      emitVoiceDebug("info", "recognizer.start() called");
    } catch (err) {
      emitVoiceDebug("warn", "rec.start() threw (likely already started)", String(err));
    }
  }, [language, clearTimers, pulseLevel, silenceTimeoutMs, stopInternal]);

  const start = useCallback(async () => {
    if (wantRunningRef.current) {
      emitVoiceDebug("info", "start ignored — already running");
      return;
    }
    emitVoiceDebug("info", "start()", { language });
    wantRunningRef.current = true;
    setStatus("starting");
    setInterim("");
    interimBufferRef.current = "";
    lastResultAtRef.current = Date.now();

    // Pre-flight: confirm mic permission via a brief getUserMedia probe,
    // then immediately release the stream so the recognizer can claim it
    // exclusively. This surfaces "denied" clearly instead of silent failure.
    try {
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
      probe.getTracks().forEach((t) => t.stop());
      emitVoiceDebug("info", "mic permission OK (probe released)");
    } catch (err: any) {
      const name = err?.name || "unknown";
      emitVoiceDebug("error", "mic probe failed", name);
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        onErrorRef.current?.(
          "Microphone permission denied. Enable it in browser settings and try again."
        );
      } else if (name === "NotFoundError") {
        onErrorRef.current?.("No microphone found on this device.");
      } else if (name === "NotReadableError") {
        onErrorRef.current?.(
          "Microphone is in use by another app. Close other apps and retry."
        );
      } else {
        onErrorRef.current?.(`Mic error: ${name}`);
      }
      wantRunningRef.current = false;
      setStatus("error");
      return;
    }

    try {
      startRecognition();
    } catch (err: any) {
      emitVoiceDebug("error", "startRecognition threw", String(err));
      onErrorRef.current?.(
        err?.message || "Could not start voice recognition."
      );
      wantRunningRef.current = false;
      setStatus("error");
      return;
    }

    if ("vibrate" in navigator) navigator.vibrate(15);
  }, [language, startRecognition]);

  const toggle = useCallback(() => {
    if (wantRunningRef.current) {
      if ("vibrate" in navigator) navigator.vibrate(10);
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  useEffect(() => {
    return () => {
      wantRunningRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {}
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    if (wantRunningRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, [language]);

  const isSupported =
    typeof window !== "undefined" &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );

  return { status, interim, level, start, stop, toggle, isSupported };
}
