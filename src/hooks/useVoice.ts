import { useCallback, useEffect, useRef, useState } from "react";

type VoiceLang = "en" | "hi" | "mr" | "ta" | "te" | "bn";

const speechLocaleMap: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
};

const getSR = (): any => {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};

export const isSpeechRecognitionSupported = () => !!getSR();
export const isSpeechSynthesisSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * Speech-to-Text hook.
 * onResult fires with the latest transcript (interim + final).
 */
export const useSpeechToText = (
  language: VoiceLang | string = "en",
  onResult?: (text: string, isFinal: boolean) => void,
) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const supported = isSpeechRecognitionSupported();

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    setError(null);
    const SR = getSR();
    if (!SR) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
    // Stop any prior session
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    const rec = new SR();
    rec.lang = speechLocaleMap[language] || "en-IN";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onstart = () => setIsListening(true);
    rec.onerror = (e: any) => {
      const code = e?.error || "error";
      if (code === "not-allowed" || code === "service-not-allowed") {
        setError("Microphone permission denied. Please allow microphone access.");
      } else if (code === "no-speech") {
        setError(null);
      } else {
        setError("Voice recognition error. Try again.");
      }
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    rec.onresult = (event: any) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      const combined = (finalText || interim).trim();
      if (combined && onResultRef.current) {
        onResultRef.current(combined, !!finalText);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      // start() can throw if already started — ignore
    }
  }, [language]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { isListening, error, supported, start, stop, toggle };
};

/** Split long text into ~200 char sentence-friendly chunks for smoother TTS. */
const chunkText = (text: string, maxLen = 200): string[] => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
  const chunks: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).trim().length > maxLen) {
      if (buf) chunks.push(buf.trim());
      if (s.length > maxLen) {
        for (let i = 0; i < s.length; i += maxLen) chunks.push(s.slice(i, i + maxLen));
        buf = "";
      } else {
        buf = s;
      }
    } else {
      buf = (buf + " " + s).trim();
    }
  }
  if (buf) chunks.push(buf.trim());
  return chunks;
};

/**
 * Text-to-Speech hook.
 */
export const useTextToSpeech = (language: VoiceLang | string = "en") => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const supported = isSpeechSynthesisSupported();
  const queueRef = useRef<string[]>([]);
  const cancelledRef = useRef(false);

  const stop = useCallback(() => {
    if (!supported) return;
    cancelledRef.current = true;
    queueRef.current = [];
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, [supported]);

  const speakNext = useCallback(() => {
    if (!supported) return;
    if (cancelledRef.current) return;
    const next = queueRef.current.shift();
    if (!next) {
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(next);
    const targetLang = speechLocaleMap[language] || "en-IN";
    const baseLang = targetLang.split("-")[0];
    u.lang = targetLang;
    u.rate = 0.92; // slightly slower for clarity
    u.pitch = 1;
    u.volume = 1;
    // Try to pick a matching voice (exact locale, then base language)
    try {
      const voices = window.speechSynthesis.getVoices();
      const match =
        voices.find((v) => v.lang?.toLowerCase() === targetLang.toLowerCase()) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith(baseLang.toLowerCase() + "-")) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith(baseLang.toLowerCase()));
      if (match) {
        u.voice = match;
        u.lang = match.lang; // align utterance lang with voice to avoid engine fallback
      }
    } catch {
      /* ignore */
    }
    u.onend = () => speakNext();
    u.onerror = () => speakNext();
    try {
      window.speechSynthesis.speak(u);
    } catch {
      setIsSpeaking(false);
    }
  }, [language, supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text?.trim()) return;
      cancelledRef.current = false;
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
      queueRef.current = chunkText(text);
      if (queueRef.current.length === 0) return;
      setIsSpeaking(true);
      setIsPaused(false);
      speakNext();
    },
    [supported, speakNext],
  );

  const pause = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch {
      /* ignore */
    }
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch {
      /* ignore */
    }
  }, [supported]);

  useEffect(() => {
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  // Some browsers load voices asynchronously
  useEffect(() => {
    if (!supported) return;
    const handler = () => {
      // no-op; just ensures voices are populated
    };
    try {
      window.speechSynthesis.onvoiceschanged = handler;
    } catch {
      /* ignore */
    }
  }, [supported]);

  return { speak, stop, pause, resume, isSpeaking, isPaused, supported };
};
