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

    // Verify caller is admin
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = claimsData.claims.email as string;
    if (email?.toLowerCase() !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for admin queries
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all users
    const { data: authUsers } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    const allUsers = authUsers?.users || [];

    // Get subscriptions
    const { data: subs } = await adminClient.from("subscriptions").select("*");
    const activeSubs = (subs || []).filter(
      (s: any) => s.plan_status === "active" && new Date(s.subscription_end_date) > new Date()
    );

    // Get payments
    const { data: payments } = await adminClient
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    const totalRevenue = (payments || [])
      .filter((p: any) => p.status === "captured")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    // Build user rows with plan status
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
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
