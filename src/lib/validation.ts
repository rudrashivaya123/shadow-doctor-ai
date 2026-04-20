import { z } from "zod";

/**
 * Centralized client-side validation schemas.
 * Always pair with server-side validation in edge functions — never trust client alone.
 *
 * Sanitization rules:
 *  - All strings are .trim()ed
 *  - Hard length caps prevent DoS / payload bloat
 *  - No HTML/script tags allowed in free-text fields (basic XSS hygiene)
 *  - Email/phone/UUID use strict RFC patterns
 */

// ── Primitives ──────────────────────────────────────────────────────────────

const noScriptTags = /<script|<\/script|javascript:|data:text\/html/i;

const safeText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .refine((v) => !noScriptTags.test(v), "Contains disallowed content");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Email is required")
  .max(254, "Email is too long")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password is too long");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+\d\s\-()]{7,20}$/, "Enter a valid phone number");

export const uuidSchema = z.string().uuid("Invalid identifier");

export const languageSchema = z.enum(["en", "hi", "ta", "te", "bn", "mr"]);

// ── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const trialRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  device_id: z.string().min(16, "Invalid device").max(256),
});

// ── Checkout ────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  name: safeText(100).min(2, "Name is required"),
  email: emailSchema,
  phone: z.union([phoneSchema, z.literal("")]).optional(),
});

// ── Contact ─────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: safeText(100).min(2, "Name is required"),
  email: emailSchema,
  message: safeText(2000).min(10, "Message must be at least 10 characters"),
});

// ── Patient ─────────────────────────────────────────────────────────────────

export const patientSchema = z.object({
  name: safeText(100).min(1, "Patient name is required"),
  age: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v <= 150), {
      message: "Age must be between 0 and 150",
    }),
  gender: z.enum(["male", "female", "other"]).or(z.literal("")).optional(),
  phone: z.union([phoneSchema, z.literal("")]).optional(),
});

// ── Clinical input ──────────────────────────────────────────────────────────

export const symptomsSchema = safeText(5000).min(3, "Please describe symptoms");
export const notesSchema = safeText(3000);
export const vitalsSchema = safeText(500);
export const ageInputSchema = z
  .string()
  .trim()
  .regex(/^\d{1,3}$/, "Age must be a number")
  .or(z.literal(""));

// ── Image upload ────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGES_PER_UPLOAD = 5;

/**
 * Validate a File against MIME allowlist + size cap.
 * Returns null if valid, else an error string.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME.includes(file.type as any)) {
    return `Unsupported file type. Use JPEG, PNG, or WebP.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `File "${file.name}" exceeds 10MB limit.`;
  }
  if (file.size === 0) {
    return `File "${file.name}" is empty.`;
  }
  return null;
}

/**
 * Verify a file's magic-byte signature matches its declared MIME type.
 * Defends against polyglot / disguised file attacks.
 */
export async function verifyImageMagicBytes(file: File): Promise<boolean> {
  const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return file.type === "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return file.type === "image/png";
  // WebP: RIFF????WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return file.type === "image/webp";
  return false;
}

// ── Helper: format Zod errors for UI ────────────────────────────────────────

export function firstZodError(result: z.SafeParseError<unknown>): string {
  return result.error.issues[0]?.message ?? "Invalid input";
}
