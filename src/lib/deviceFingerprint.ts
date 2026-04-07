// Generates a stable browser-based device fingerprint
export async function generateDeviceId(): Promise<string> {
  const components: string[] = [];

  // Screen properties
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  components.push(`${screen.availWidth}x${screen.availHeight}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);
  components.push((navigator.languages || []).join(","));

  // Platform
  components.push(navigator.platform || "unknown");

  // Hardware concurrency
  components.push(String(navigator.hardwareConcurrency || 0));

  // Device memory (if available)
  components.push(String((navigator as any).deviceMemory || 0));

  // Touch support
  components.push(String(navigator.maxTouchPoints || 0));

  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "alphabetic";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = "#069";
      ctx.fillText("ShadowMD Device FP", 2, 15);
      ctx.fillStyle = "rgba(102,204,0,0.7)";
      ctx.fillText("ShadowMD Device FP", 4, 17);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    components.push("no-canvas");
  }

  // WebGL renderer
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        components.push(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "");
      }
    }
  } catch {
    components.push("no-webgl");
  }

  const raw = components.join("|");

  // Hash using SubtleCrypto
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Cache the fingerprint in sessionStorage
let cachedId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;

  const stored = sessionStorage.getItem("shadowmd_device_fp");
  if (stored) {
    cachedId = stored;
    return stored;
  }

  const id = await generateDeviceId();
  sessionStorage.setItem("shadowmd_device_fp", id);
  cachedId = id;
  return id;
}
