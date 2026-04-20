// Shared input-validation helpers for Supabase Edge Functions.
// Import via: import { ... } from "../_shared/validation.ts"
import { z } from "npm:zod@3.23.8";

// ── Sanitizers ──────────────────────────────────────────────────────────────
const SCRIPT_TAG = /<script\b|<\/script>|javascript:|data:text\/html/i;
const CTRL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Strip control chars, cap length, trim. Use for ALL free-text inputs. */
export function sanitizeText(input: unknown, maxLen: number): string {
  if (typeof input !== "string") return "";
  return input.replace(CTRL_CHARS, "").trim().slice(0, maxLen);
}

/** Reject strings containing HTML/script injection markers. */
export function isSafeText(input: string): boolean {
  return !SCRIPT_TAG.test(input);
}

// ── Primitives ──────────────────────────────────────────────────────────────
export const zEmail = z.string().trim().toLowerCase().min(3).max(254).email();
export const zPassword = z.string().min(6).max(128);
export const zPhone = z.string().trim().regex(/^[+\d\s\-()]{7,20}$/);
export const zUuid = z.string().uuid();
export const zLanguage = z.enum(["en", "hi", "ta", "te", "bn", "mr"]);
export const zSpecialty = z.enum(["general", "pediatrics", "orthopedics"]);
export const zDeviceId = z.string().min(16).max(256);

const safeStr = (max: number) =>
  z.string().trim().max(max).refine(isSafeText, "Contains disallowed content");

// ── Schemas per endpoint ────────────────────────────────────────────────────
export const trialRegisterBody = z.object({
  email: zEmail,
  password: zPassword,
  device_id: zDeviceId,
});

export const verifyOtpBody = z.object({
  device_id: zDeviceId,
  phone: zPhone,
  otp: z.string().regex(/^\d{4,8}$/, "OTP must be 4-8 digits"),
});

export const checkoutOrderBody = z.object({
  name: safeStr(100).min(2),
  email: zEmail,
  phone: z.union([zPhone, z.literal("")]).optional(),
});

export const checkoutVerifyBody = z.object({
  razorpay_order_id: z.string().min(5).max(100),
  razorpay_payment_id: z.string().min(5).max(100),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid signature format"),
  name: safeStr(100).min(2),
  email: zEmail,
  phone: z.union([zPhone, z.literal("")]).optional(),
});

export const verifyPaymentAuthedBody = z.object({
  razorpay_order_id: z.string().min(5).max(100),
  razorpay_payment_id: z.string().min(5).max(100),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid signature format"),
});

export const consultationBody = z.object({
  symptoms: safeStr(5000).min(3),
  notes: safeStr(3000).optional().default(""),
  language: zLanguage.optional().default("en"),
  specialty: zSpecialty.optional().default("general"),
  learningMode: z.boolean().optional().default(false),
});

export const copilotBody = z.object({
  symptoms: safeStr(2000).min(3),
  age: z.union([z.string(), z.number()]).optional(),
  gender: safeStr(20).optional(),
  temp: safeStr(20).optional(),
  spo2: safeStr(20).optional(),
  language: zLanguage.optional().default("en"),
});

export const evismartBody = z.object({
  symptoms: safeStr(2000).min(3),
  age: z.union([z.string(), z.number()]).optional(),
  gender: safeStr(20).optional(),
  vitals: safeStr(500).optional(),
  language: zLanguage.optional().default("en"),
});

export const adminActionBody = z
  .object({
    action: z.enum(["expire-trial", "set-test-trial"]).optional(),
    user_id: zUuid.optional(),
    end_date: z.string().datetime().optional(),
  })
  .optional();

const imageItem = z.object({
  base64: z.string().min(20).max(15_000_000), // ~11MB encoded
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  label: safeStr(100).optional().default("Image"),
  note: safeStr(500).optional().default(""),
});

export const analyzeImageBody = z
  .object({
    mode: z.enum(["analyze", "compare"]).optional().default("analyze"),
    context: safeStr(2000).optional().default(""),
    language: zLanguage.optional().default("en"),
    images: z.array(imageItem).min(1).max(5).optional(),
    imageBase64: z.string().min(20).max(15_000_000).optional(),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).optional(),
  })
  .refine(
    (d) => (d.images && d.images.length > 0) || (d.imageBase64 && d.mimeType),
    { message: "At least one image is required" }
  );

// ── Helper: parse + format error response ───────────────────────────────────
export function badRequest(message: string, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function parseBody<T extends z.ZodTypeAny>(
  schema: T,
  raw: unknown,
): { ok: true; data: z.infer<T> } | { ok: false; message: string } {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join(".") || "input";
    return { ok: false, message: `${path}: ${issue?.message ?? "Invalid"}` };
  }
  return { ok: true, data: result.data };
}
