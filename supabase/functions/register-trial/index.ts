import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { trialRegisterBody, parseBody } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(length = 24): string {
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

    const parsed = parseBody(trialRegisterBody, raw);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { device_id, email, password } = parsed.data;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if device_id already has a verified trial
    const { data: existingDevice } = await adminClient
      .from("trial_devices")
      .select("id, status, paid, email")
      .eq("device_id", device_id)
      .eq("status", "active")
      .maybeSingle();

    if (existingDevice) {
      // If same email is trying again on same device, treat as login (not abuse)
      if (existingDevice.email === email) {
        // Sign in and return existing session
        const anonClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!
        );
        const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError || !signInData?.session) {
          return new Response(
            JSON.stringify({ error: "Invalid password. Please try again." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: existingSub } = await adminClient
          .from("subscriptions")
          .select("subscription_end_date")
          .eq("user_id", signInData.user.id)
          .maybeSingle();

        return new Response(
          JSON.stringify({
            success: true,
            trial_end: existingSub?.subscription_end_date,
            session: {
              access_token: signInData.session.access_token,
              refresh_token: signInData.session.refresh_token,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "A free trial has already been used on this device." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email already has a trial on a different device — let them sign in
    const { data: existingEmail } = await adminClient
      .from("trial_devices")
      .select("id, status")
      .eq("email", email)
      .eq("status", "active")
      .maybeSingle();

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: "A free trial already exists for this email. Please sign in instead." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to create user account
    let userId: string;
    let isExistingUser = false;

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { is_trial: true, device_id },
    });

    if (createError) {
      // User already exists — try signing them in
      if (createError.message?.includes("already been registered")) {
        isExistingUser = true;

        // Sign in to verify password and get user ID
        const anonClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!
        );
        const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError || !signInData?.user) {
          return new Response(
            JSON.stringify({ error: "This email is already registered. Please sign in with the correct password." }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = signInData.user.id;

        // Check if this user already has an active subscription
        const { data: existingSub } = await adminClient
          .from("subscriptions")
          .select("plan_status, subscription_end_date")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingSub) {
          // Return existing session directly
          return new Response(
            JSON.stringify({
              success: true,
              trial_end: existingSub.subscription_end_date,
              session: signInData.session
                ? {
                    access_token: signInData.session.access_token,
                    refresh_token: signInData.session.refresh_token,
                  }
                : null,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        console.error("User creation error:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create account. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      userId = newUser.user!.id;
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

    // Clean up any old pending records for this device
    await adminClient
      .from("trial_devices")
      .delete()
      .eq("device_id", device_id)
      .eq("status", "pending");

    // Create trial_devices record
    const { error: insertError } = await adminClient.from("trial_devices").insert({
      device_id,
      email,
      phone: email, // phone column is NOT NULL, use email as placeholder
      user_id: userId,
      otp_verified: true,
      status: "active",
      trial_start_date: now.toISOString(),
      trial_end_date: trialEnd.toISOString(),
      paid: false,
    });

    if (insertError) {
      console.error("Insert trial_devices error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to register trial. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create subscription record
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
    console.error("register-trial error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
