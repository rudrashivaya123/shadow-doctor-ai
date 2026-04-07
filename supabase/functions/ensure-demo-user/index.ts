import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_EMAIL = "demo@shadowmd.com";
const DEMO_PASSWORD = "Demo@123";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Check if demo user exists
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const demoUser = users?.users?.find((u) => u.email === DEMO_EMAIL);

    if (demoUser) {
      // Update password to ensure it matches
      await supabaseAdmin.auth.admin.updateUserById(demoUser.id, {
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      return new Response(JSON.stringify({ status: "ready" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create demo user
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ status: "created" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
