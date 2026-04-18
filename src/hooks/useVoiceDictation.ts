import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/types/clinical";

/**
 * Robust voice dictation hook for clinical OPD environments.
 * - WebAudio pipeline: high-pass + band-pass (human voice) + dynamic compression (AGC) + browser noise suppression
 * - Continuous Web Speech recognition with interim results
 * - 2s silence auto-stop (configurable), so natural pauses don't truncate sentences
 * - Auto-recovery on transient errors (network, no-speech, aborted)
 * - Returns committed + interim transcripts so UI can show live feedback
 */

const speechLocale: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  mr: "mr-IN",
};

export type DictationStatus = "idle" | "starting" | "listening" | "processing" | "error";

interface Options {
  language: Language;
  /** ms of silence before auto-stop (default 2000) */
  silenceTimeoutMs?: number;
  /** called when a final segment is committed; UI should append to its textarea */
  onCommit: (text: string) => void;
  /** unrecoverable error message */
  onError?: (msg: string) => void;
}

const RECOVERABLE_ERRORS = new Set(["no-speech", "aborted", "network", "audio-capture"]);

export function useVoiceDictation({
  language,
  silenceTimeoutMs = 2000,
  onCommit,
  onError,
}: Options) {
  const [status, setStatus] = useState<DictationStatus>("idle");
  const [interim, setInterim] = useState("");
  const [level, setLevel] = useState(0); // 0..1 mic level for visualizer

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const wantRunningRef = useRef(false);
  const lastSpeechAtRef = useRef<number>(0);
  const restartAttemptsRef = useRef(0);
  const interimBufferRef = useRef("");

  const cleanupAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
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
      wantRunningRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (commitInterim && interimBufferRef.current.trim()) {
        onCommit(interimBufferRef.current.trim());
      }
      interimBufferRef.current = "";
      setInterim("");
      cleanupAudio();
      setStatus("idle");
    },
    [cleanupAudio, onCommit]
  );

  const stop = useCallback(() => stopInternal(true), [stopInternal]);

  const setupAudioPipeline = useCallback(async () => {
    // Request mic with browser-side noise suppression, AGC, and echo cancellation
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 16000,
      } as MediaTrackConstraints,
    });
    streamRef.current = stream;

    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx: AudioContext = new AudioCtx();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);

    // High-pass at 85Hz removes fan rumble, AC hum
    const highPass = ctx.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 85;

    // Band-pass centered on human speech (300-3400 Hz telephone band) suppresses ambient hiss
    const bandPass = ctx.createBiquadFilter();
    bandPass.type = "bandpass";
    bandPass.frequency.value = 1700;
    bandPass.Q.value = 0.5;

    // Compressor as adaptive gain — boosts soft voices, prevents distortion on shouts
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
    // Note: we don't connect to ctx.destination — analysis only, no playback feedback.

    // Visual level loop + voice-activity detection
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
        // Detected voice — reset silence timer
        lastSpeechAtRef.current = Date.now();
        if (silenceTimerRef.current) {
          window.clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else if (
        wantRunningRef.current &&
        !silenceTimerRef.current &&
        lastSpeechAtRef.current > 0 &&
        Date.now() - lastSpeechAtRef.current > 400
      ) {
        // Sustained silence after speech — start auto-stop countdown
        silenceTimerRef.current = window.setTimeout(() => {
          stopInternal(true);
        }, silenceTimeoutMs);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [silenceTimeoutMs, stopInternal]);

  const startRecognition = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      onError?.("Voice input not supported in this browser. Try Chrome.");
      setStatus("error");
      return;
    }
    const rec = new SR();
    rec.lang = speechLocale[language] || "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      restartAttemptsRef.current = 0;
      setStatus("listening");
    };

    rec.onresult = (event: any) => {
      let interimChunk = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0]?.transcript ?? "";
        if (res.isFinal) finalChunk += txt + " ";
        else interimChunk += txt;
      }
      if (finalChunk) {
        onCommit(finalChunk.trim());
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
      if (RECOVERABLE_ERRORS.has(err) && wantRunningRef.current) {
        // Auto-recover — recognizer often errors with "no-speech" on long pauses
        return;
      }
      onError?.(`Voice error: ${err}`);
      stopInternal(false);
      setStatus("error");
    };

    rec.onend = () => {
      // Browser auto-ends after ~60s; restart if user still wants to dictate
      if (wantRunningRef.current && restartAttemptsRef.current < 5) {
        restartAttemptsRef.current++;
        try {
          rec.start();
        } catch {
          stopInternal(true);
        }
      } else if (wantRunningRef.current) {
        stopInternal(true);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      // Already started — ignore
    }
  }, [language, onCommit, onError, stopInternal]);

  const start = useCallback(async () => {
    if (wantRunningRef.current) return;
    wantRunningRef.current = true;
    setStatus("starting");
    setInterim("");
    interimBufferRef.current = "";
    lastSpeechAtRef.current = 0;
    try {
      await setupAudioPipeline();
      startRecognition();
      // Subtle haptic on supported devices
      if ("vibrate" in navigator) navigator.vibrate(15);
    } catch (err: any) {
      const msg = err?.message || "Could not access microphone";
      onError?.(msg);
      cleanupAudio();
      wantRunningRef.current = false;
      setStatus("error");
    }
  }, [cleanupAudio, onError, setupAudioPipeline, startRecognition]);

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
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return { status, interim, level, start, stop, toggle, isSupported };
}
