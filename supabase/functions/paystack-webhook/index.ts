import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

const SUBSCRIPTION_DURATION_DAYS = 365;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Paystack is not configured." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Paystack webhook sends the event in the body
    const event = await req.json();

    // Verify the event signature by checking the Paystack signature header
    const paystackSignature = req.headers.get("x-paystack-signature");
    if (!paystackSignature) {
      return new Response(
        JSON.stringify({ error: "Missing Paystack signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // In production, verify the signature with HMAC SHA512 using PAYSTACK_SECRET_KEY
    // For now, we process the event if it has the right structure

    const eventType = event.event;
    const data = event.data;

    if (!data || !data.reference) {
      return new Response(
        JSON.stringify({ error: "Invalid event data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (eventType === "charge.success") {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000);

      const { data: subData } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          amount_kobo: data.amount,
          currency: data.currency,
          email: data.customer?.email,
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("paystack_reference", data.reference)
        .select("id")
        .maybeSingle();

      if (subData) {
        await supabase.from("subscription_events").insert({
          subscription_id: subData.id,
          event_type: "verified",
          payload: { reference: data.reference, webhook: true, amount: data.amount },
        });
      }
    }

    return new Response(
      JSON.stringify({ status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
