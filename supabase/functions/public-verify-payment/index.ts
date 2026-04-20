import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkoutVerifyBody, parseBody } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSig === signature;
}

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = parseBody(checkoutVerifyBody, raw);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      phone,
    } = parsed.data;

    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use admin client for user creation
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user already exists
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email === email.toLowerCase()
    );

    let userId: string;
    let isNewUser = false;
    const password = generatePassword();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with auto-confirmed email
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: { full_name: name, phone: phone || "" },
      });

      if (createError || !newUser?.user) {
        console.error("User creation error:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;
      isNewUser = true;
    }

    // Record payment
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await adminClient.from("payments").insert({
      user_id: userId,
      amount: 149900,
      currency: "INR",
      status: "success",
      razorpay_payment_id,
      razorpay_order_id,
    });

    // Upsert subscription
    await adminClient.from("subscriptions").upsert(
      {
        user_id: userId,
        plan_status: "active",
        subscription_start_date: now.toISOString(),
        subscription_end_date: endDate.toISOString(),
        razorpay_payment_id,
        razorpay_order_id,
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    );

    // Sign in the user to get a session
    const { data: signInData, error: signInError } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: email.toLowerCase(),
    });

    // Also sign in with password for immediate session
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    let session = null;
    if (isNewUser) {
      const { data: sessionData } = await anonClient.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });
      session = sessionData?.session;
    }

    return new Response(
      JSON.stringify({
        success: true,
        is_new_user: isNewUser,
        user_id: userId,
        session: session
          ? {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }
          : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
