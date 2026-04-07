import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "shadowmd.app@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check request body for action-based routing
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // No body — default to admin dashboard action
    }

    // ─── Action: expire-trial (dev testing, any authenticated user can expire their own trial) ───
    if (body?.action === "expire-trial") {
      const targetUserId = body.user_id;
      const endDate = body.end_date;

      // Only allow users to expire their own trial
      if (targetUserId !== user.id) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: updateError } = await adminClient
        .from("subscriptions")
        .update({
          subscription_end_date: endDate,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", targetUserId)
        .eq("plan_status", "trial");

      if (updateError) {
        console.error("Expire trial error:", updateError);
        return new Response(JSON.stringify({ error: "Failed to expire trial" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Action: set-test-trial (create a 2-minute trial for testing) ───
    if (body?.action === "set-test-trial") {
      const targetUserId = body.user_id;
      if (targetUserId !== user.id) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const now = new Date();
      const endDate = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes

      const { error: updateError } = await adminClient
        .from("subscriptions")
        .upsert({
          user_id: targetUserId,
          plan_status: "trial",
          subscription_start_date: now.toISOString(),
          subscription_end_date: endDate.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: "user_id" });

      if (updateError) {
        console.error("Set test trial error:", updateError);
        return new Response(JSON.stringify({ error: "Failed to set test trial" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, expires_at: endDate.toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Default: Admin dashboard data (admin-only) ───
    const email = user.email;
    if (email?.toLowerCase() !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const allUsers = authUsers?.users || [];

    const { data: subs } = await adminClient.from("subscriptions").select("*");
    const activeSubs = (subs || []).filter(
      (s: any) => s.plan_status === "active" && new Date(s.subscription_end_date) > new Date()
    );

    const { data: payments } = await adminClient
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    const totalRevenue = (payments || [])
      .filter((p: any) => p.status === "captured")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const subsByUser = new Map<string, string>();
    for (const s of activeSubs) {
      subsByUser.set(s.user_id, s.plan_status);
    }

    const userRows = allUsers.map((u: any) => ({
      id: u.id,
      email: u.email || "",
      created_at: u.created_at,
      plan_status: subsByUser.get(u.id) || "free",
    }));

    return new Response(
      JSON.stringify({
        metrics: {
          totalUsers: allUsers.length,
          totalPayments: (payments || []).length,
          activeSubscriptions: activeSubs.length,
          revenue: totalRevenue,
        },
        users: userRows,
        payments: payments || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Admin-data error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
