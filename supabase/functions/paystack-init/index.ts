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

const PREMIUM_PLAN = "premium";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Paystack is not configured. Please set PAYSTACK_SECRET_KEY in your project secrets." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const { user_id, email, callback_url, currency, minor_units } = body;

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id. You must be signed in." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!currency || !minor_units) {
      return new Response(
        JSON.stringify({ error: "Missing currency or amount. Call /paystack-pricing first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const reference = `oj_${user_id.slice(0, 12)}_${Date.now()}`;

    const { error: insertError } = await supabase.from("subscriptions").insert({
      user_id,
      paystack_reference: reference,
      plan: PREMIUM_PLAN,
      status: "pending",
      amount_kobo: minor_units,
      currency,
      email,
    });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to initialize subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: subRow } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("paystack_reference", reference)
      .maybeSingle();

    await supabase.from("subscription_events").insert({
      subscription_id: subRow?.id,
      event_type: "initialized",
      payload: { reference, email, amount: minor_units, currency, user_id },
    });

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: minor_units,
        currency,
        reference,
        callback_url: callback_url || `${req.headers.get("origin") || ""}/?ref=${reference}`,
        metadata: {
          user_id,
          plan: PREMIUM_PLAN,
          custom_fields: [
            { display_name: "Product", variable_name: "product", value: "Owner's Journey Premium" },
            { display_name: "USD Price", variable_name: "usd_price", value: "$25 USD" },
          ],
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return new Response(
        JSON.stringify({ error: paystackData.message || "Failed to initialize payment with Paystack" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        authorization_url: paystackData.data.authorization_url,
        reference,
        access_code: paystackData.data.access_code,
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
