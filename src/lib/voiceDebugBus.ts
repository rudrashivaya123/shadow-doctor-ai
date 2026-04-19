/**
 * Tiny pub/sub for voice dictation debug events so we can render an on-screen
 * overlay on real devices (Android, etc.) without DevTools access.
 */

export interface VoiceDebugEvent {
  ts: number;
  level: "info" | "warn" | "error";
  msg: string;
  data?: any;
}

type Listener = (event: VoiceDebugEvent) => void;

const listeners = new Set<Listener>();
const buffer: VoiceDebugEvent[] = [];
const MAX_BUFFER = 50;

export function emitVoiceDebug(
  level: VoiceDebugEvent["level"],
  msg: string,
  data?: any
) {
  const event: VoiceDebugEvent = { ts: Date.now(), level, msg, data };
  buffer.push(event);
  if (buffer.length > MAX_BUFFER) buffer.shift();
  // eslint-disable-next-line no-console
  console.log(`[voice]`, msg, data ?? "");
  listeners.forEach((l) => {
    try {
      l(event);
    } catch {
      /* noop */
    }
  });
}

export function subscribeVoiceDebug(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVoiceDebugBuffer(): VoiceDebugEvent[] {
  return [...buffer];
}

export function clearVoiceDebug() {
  buffer.length = 0;
  listeners.forEach((l) =>
    l({ ts: Date.now(), level: "info", msg: "— cleared —" })
  );
}
