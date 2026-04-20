import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyOtpBody, parseBody } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(length = 20): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
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
    const parsed = parseBody(verifyOtpBody, raw);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { device_id, phone, otp } = parsed.data;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find pending trial record
    const { data: record, error: fetchError } = await adminClient
      .from("trial_devices")
      .select("*")
      .eq("device_id", device_id)
      .eq("phone", phone)
      .eq("otp_verified", false)
      .eq("status", "pending")
      .maybeSingle();

    if (fetchError || !record) {
      return new Response(
        JSON.stringify({ error: "No pending trial found. Please request a new OTP." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check OTP expiry
    if (new Date(record.otp_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "OTP has expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify OTP
    if (record.otp_code !== otp) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // OTP verified — create user account
    const email = `trial_${phone.replace(/\+/g, "")}@shadowmd.trial`;
    const password = generatePassword();

    // Check if user already exists with this email
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email === email
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone, is_trial: true, device_id },
      });

      if (createError || !newUser?.user) {
        console.error("User creation error:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create trial account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = newUser.user.id;
    }

    // Set trial dates
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    // Update trial_devices record
    await adminClient
      .from("trial_devices")
      .update({
        otp_verified: true,
        user_id: userId,
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        status: "active",
        otp_code: null, // Clear OTP
        updated_at: now.toISOString(),
      })
      .eq("id", record.id);

    // Create/update subscription record
    await adminClient.from("subscriptions").upsert(
      {
        user_id: userId,
        plan_status: "trial",
        subscription_start_date: now.toISOString(),
        subscription_end_date: trialEnd.toISOString(),
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    );

    // Sign in user to get session
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: sessionData } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    return new Response(
      JSON.stringify({
        success: true,
        trial_end: trialEnd.toISOString(),
        session: sessionData?.session
          ? {
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
            }
          : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-trial-otp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
