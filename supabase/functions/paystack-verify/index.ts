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

    const body = await req.json();
    const { reference, user_id } = body;

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Missing transaction reference" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      return new Response(
        JSON.stringify({ error: verifyData.message || "Payment verification failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payment = verifyData.data;

    if (payment.status !== "success") {
      await supabase
        .from("subscriptions")
        .update({ status: payment.status, updated_at: new Date().toISOString() })
        .eq("paystack_reference", reference);

      return new Response(
        JSON.stringify({ error: `Payment not successful. Status: ${payment.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Payment confirmed — activate the subscription
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    const { data: subData, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        amount_kobo: payment.amount,
        currency: payment.currency,
        email: payment.customer?.email,
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("paystack_reference", reference)
      .eq("user_id", user_id)
      .select("id, user_id")
      .maybeSingle();

    if (updateError || !subData) {
      return new Response(
        JSON.stringify({ error: "Failed to activate subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await supabase.from("subscription_events").insert({
      subscription_id: subData.id,
      event_type: "verified",
      payload: { reference, amount: payment.amount, email: payment.customer?.email },
    });

    return new Response(
      JSON.stringify({
        status: "active",
        expires_at: expiresAt.toISOString(),
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
