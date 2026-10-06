import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAILS = ["admin@ownersjourney.com", "admin@bolt.com"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
      return new Response(
        JSON.stringify({ error: "Forbidden — admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const [subsRes, activeSubsRes, pendingSubsRes, eventsRes, tasksRes, stagesRes] = await Promise.all([
      supabase.from("subscriptions").select("id, status, amount_kobo, currency, email, created_at, activated_at, expires_at, user_id").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("amount_kobo, currency").eq("status", "active"),
      supabase.from("subscriptions").select("id").eq("status", "pending"),
      supabase.from("subscription_events").select("id, event_type, created_at, subscription_id").order("created_at", { ascending: false }).limit(50),
      supabase.from("journey_tasks").select("id, is_completed, stage_id"),
      supabase.from("journey_stages").select("id, title, stage_order"),
    ]);

    const allSubs = subsRes.data ?? [];
    const activeSubs = activeSubsRes.data ?? [];
    const pendingCount = pendingSubsRes.data?.length ?? 0;
    const events = eventsRes.data ?? [];
    const tasks = tasksRes.data ?? [];
    const stages = stagesRes.data ?? [];

    const totalUsers = new Set(allSubs.filter((s: { user_id: string | null }) => s.user_id).map((s: { user_id: string | null }) => s.user_id)).size;
    const totalSubs = allSubs.length;
    const activeCount = activeSubs.length;

    const revenueByCurrency: Record<string, number> = {};
    for (const s of activeSubs) {
      const cur = s.currency || "NGN";
      const amt = s.amount_kobo || 0;
      revenueByCurrency[cur] = (revenueByCurrency[cur] || 0) + amt;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: { is_completed: boolean }) => t.is_completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const recentSubs = allSubs.slice(0, 10);
    const recentEvents = events.slice(0, 20);

    return new Response(
      JSON.stringify({
        total_users: totalUsers,
        total_subscriptions: totalSubs,
        active_subscriptions: activeCount,
        pending_subscriptions: pendingCount,
        revenue_by_currency: revenueByCurrency,
        recent_subscriptions: recentSubs,
        recent_events: recentEvents,
        task_stats: {
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completion_rate: completionRate,
        },
        stage_count: stages.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
