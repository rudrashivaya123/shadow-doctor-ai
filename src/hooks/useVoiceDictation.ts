import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/types/clinical";

/**
 * Clinical-grade voice dictation hook.
 *
 * KEY FIX (vs previous version):
 *  - The Web Speech API opens its OWN microphone stream internally. If we ALSO
 *    call getUserMedia() in parallel, on Chromium/Android the recognizer often
 *    silently produces no results (audio capture works, transcription never fires).
 *    => We now let the recognizer own the mic. We open getUserMedia ONLY to obtain
 *       a parallel stream for the level visualizer, and we tolerate failure there.
 *  - onCommit / onError are stored in refs so the recognizer always calls the
 *    latest closure (no stale callbacks across re-renders).
 *  - Added verbose debug logging (prefixed [voice]) so you can see in the
 *    browser console exactly what the recognizer is doing.
 *  - "no-speech" / "aborted" are silently restarted while user wants to dictate.
 *  - Final-result heartbeat: if 8s pass with no result event after start,
 *    we surface "No speech detected" to the user instead of failing silently.
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
  /** ms of silence before auto-stop (default 2000) */
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

const log = (...args: any[]) =>
  // eslint-disable-next-line no-console
  console.log("[voice]", ...args);

export function useVoiceDictation({
  language,
  silenceTimeoutMs = 2000,
  onCommit,
  onError,
}: Options) {
  const [status, setStatus] = useState<DictationStatus>("idle");
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0); // 0..1 mic level for visualizer

  // Stable refs for callbacks (recognizer keeps the original reference otherwise)
  const onCommitRef = useRef(onCommit);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const wantRunningRef = useRef(false);
  const lastSpeechAtRef = useRef<number>(0);
  const lastResultAtRef = useRef<number>(0);
  const restartAttemptsRef = useRef(0);
  const interimBufferRef = useRef("");
  const startedAtRef = useRef<number>(0);
  const noSpeechWatchdogRef = useRef<number | null>(null);

  const cleanupAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    if (noSpeechWatchdogRef.current)
      window.clearTimeout(noSpeechWatchdogRef.current);
    noSpeechWatchdogRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  }, []);

  const stopInternal = useCallback(
    (commitInterim: boolean) => {
      log("stop", { commitInterim, hasInterim: !!interimBufferRef.current });
      wantRunningRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch (e) {
        log("recognizer.stop() threw", e);
      }
      if (commitInterim && interimBufferRef.current.trim()) {
        try {
          onCommitRef.current?.(interimBufferRef.current.trim());
        } catch (e) {
          log("onCommit threw on stop", e);
        }
      }
      interimBufferRef.current = "";
      setInterim("");
      cleanupAudio();
      setStatus("idle");
    },
    [cleanupAudio]
  );

  const stop = useCallback(() => stopInternal(true), [stopInternal]);

  /**
   * Sets up an OPTIONAL audio analyser stream just for the level visualizer.
   * Failure is non-fatal — recognizer still works without it.
   */
  const setupAnalyserPipeline = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        } as MediaTrackConstraints,
      });
      streamRef.current = stream;

      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx: AudioContext = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);

      const highPass = ctx.createBiquadFilter();
      highPass.type = "highpass";
      highPass.frequency.value = 85;

      const bandPass = ctx.createBiquadFilter();
      bandPass.type = "bandpass";
      bandPass.frequency.value = 1700;
      bandPass.Q.value = 0.5;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -45;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      source.connect(highPass);
      highPass.connect(bandPass);
      bandPass.connect(compressor);
      compressor.connect(analyser);

      const buffer = new Uint8Array(analyser.fftSize);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          const v = (buffer[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / buffer.length);
        setLevel(Math.min(1, rms * 4));
        if (rms > 0.02) {
          lastSpeechAtRef.current = Date.now();
          if (silenceTimerRef.current) {
            window.clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (
          wantRunningRef.current &&
          !silenceTimerRef.current &&
          lastSpeechAtRef.current > 0 &&
          Date.now() - lastSpeechAtRef.current > 600
        ) {
          silenceTimerRef.current = window.setTimeout(() => {
            log("silence auto-stop fired");
            stopInternal(true);
          }, silenceTimeoutMs);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      log("analyser pipeline failed (non-fatal)", err);
      // We deliberately swallow — recognizer can still work.
    }
  }, [silenceTimeoutMs, stopInternal]);

  const startRecognition = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
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
      log("recognizer started", { lang: rec.lang });
      restartAttemptsRef.current = 0;
      startedAtRef.current = Date.now();
      lastResultAtRef.current = Date.now();
      setStatus("listening");

      // Watchdog: if we get NO result within 8s of start AND user is still
      // wanting to record, surface a clear error rather than fail silently.
      if (noSpeechWatchdogRef.current)
        window.clearTimeout(noSpeechWatchdogRef.current);
      noSpeechWatchdogRef.current = window.setTimeout(() => {
        if (!wantRunningRef.current) return;
        const sinceLast = Date.now() - lastResultAtRef.current;
        if (sinceLast >= 8000) {
          log("watchdog: no transcription in 8s");
          onErrorRef.current?.(
            "No speech detected. Check mic permissions and try speaking louder."
          );
        }
      }, 8500);
    };

    rec.onaudiostart = () => log("recognizer onaudiostart");
    rec.onsoundstart = () => log("recognizer onsoundstart");
    rec.onspeechstart = () => log("recognizer onspeechstart");
    rec.onspeechend = () => log("recognizer onspeechend");

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
      log("onresult", {
        final: finalChunk,
        interim: interimChunk,
      });
      if (finalChunk) {
        try {
          onCommitRef.current?.(finalChunk.trim());
        } catch (e) {
          log("onCommit threw", e);
        }
        interimBufferRef.current = "";
        setInterim("");
      }
      if (interimChunk) {
        interimBufferRef.current = interimChunk;
        setInterim(interimChunk);
      }
      lastSpeechAtRef.current = Date.now();
    };

    rec.onerror = (e: any) => {
      const err = e?.error || "unknown";
      log("recognizer onerror", err, e);
      if (err === "not-allowed" || err === "service-not-allowed") {
        onErrorRef.current?.(
          "Microphone permission denied. Please enable it in browser settings."
        );
        wantRunningRef.current = false;
        cleanupAudio();
        setStatus("error");
        return;
      }
      if (RECOVERABLE_ERRORS.has(err) && wantRunningRef.current) {
        // Auto-recover; onend will restart.
        return;
      }
      onErrorRef.current?.(`Voice error: ${err}. Couldn't process voice.`);
      stopInternal(false);
      setStatus("error");
    };

    rec.onend = () => {
      log("recognizer ended", {
        wantRunning: wantRunningRef.current,
        attempts: restartAttemptsRef.current,
      });
      if (wantRunningRef.current && restartAttemptsRef.current < 5) {
        restartAttemptsRef.current++;
        try {
          rec.start();
          log("recognizer restarted, attempt", restartAttemptsRef.current);
        } catch (e) {
          log("recognizer restart failed", e);
          stopInternal(true);
        }
      } else if (wantRunningRef.current) {
        log("max restart attempts hit, stopping");
        stopInternal(true);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      log("recognizer.start() called");
    } catch (err) {
      log("recognizer.start() threw (likely already started)", err);
    }
  }, [language, cleanupAudio, stopInternal]);

  const start = useCallback(async () => {
    if (wantRunningRef.current) {
      log("start ignored — already running");
      return;
    }
    log("start requested", { language });
    wantRunningRef.current = true;
    setStatus("starting");
    setInterim("");
    interimBufferRef.current = "";
    lastSpeechAtRef.current = 0;
    lastResultAtRef.current = Date.now();

    // Start recognizer FIRST — it owns the mic. Analyser is best-effort.
    try {
      startRecognition();
    } catch (err: any) {
      log("startRecognition threw", err);
      onErrorRef.current?.(
        err?.message || "Could not start voice recognition."
      );
      wantRunningRef.current = false;
      setStatus("error");
      return;
    }

    // Best-effort analyser for visualizer + silence detection.
    // If this fails (e.g. mic busy), we keep going — recognizer still works.
    setupAnalyserPipeline().catch((err) => {
      log("analyser pipeline rejected (non-fatal)", err);
    });

    if ("vibrate" in navigator) navigator.vibrate(15);
  }, [language, setupAnalyserPipeline, startRecognition]);

  const toggle = useCallback(() => {
    if (wantRunningRef.current) {
      if ("vibrate" in navigator) navigator.vibrate(10);
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wantRunningRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {}
      cleanupAudio();
    };
  }, [cleanupAudio]);

  // If language changes mid-session, restart recognizer
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
