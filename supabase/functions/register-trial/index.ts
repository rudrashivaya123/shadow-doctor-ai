import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateOTP(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { device_id, phone, action } = body;

    if (!device_id || typeof device_id !== "string" || device_id.length < 16) {
      return new Response(
        JSON.stringify({ error: "Invalid device identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!phone || typeof phone !== "string" || !/^\+\d{10,15}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number. Use format: +91XXXXXXXXXX" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if device_id already has a verified trial
    const { data: existingDevice } = await adminClient
      .from("trial_devices")
      .select("id, status, otp_verified")
      .eq("device_id", device_id)
      .eq("otp_verified", true)
      .maybeSingle();

    if (existingDevice) {
      return new Response(
        JSON.stringify({ error: "A free trial has already been used on this device." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if phone already has a verified trial
    const { data: existingPhone } = await adminClient
      .from("trial_devices")
      .select("id, status, otp_verified")
      .eq("phone", phone)
      .eq("otp_verified", true)
      .maybeSingle();

    if (existingPhone) {
      return new Response(
        JSON.stringify({ error: "A free trial has already been used with this phone number." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Upsert pending trial record (delete old unverified entries for this device/phone)
    await adminClient
      .from("trial_devices")
      .delete()
      .eq("device_id", device_id)
      .eq("otp_verified", false);

    await adminClient
      .from("trial_devices")
      .delete()
      .eq("phone", phone)
      .eq("otp_verified", false);

    const { error: insertError } = await adminClient.from("trial_devices").insert({
      device_id,
      phone,
      otp_code: otp,
      otp_expires_at: otpExpiresAt.toISOString(),
      otp_verified: false,
      status: "pending",
    });

    if (insertError) {
      console.error("Insert trial_devices error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to register trial. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In production, send OTP via SMS (Twilio etc.)
    // For now, log OTP for dev/testing purposes
    console.log(`[TRIAL OTP] Phone: ${phone}, OTP: ${otp}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent to your phone number.",
        // DEV ONLY: Remove in production
        dev_otp: otp,
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
