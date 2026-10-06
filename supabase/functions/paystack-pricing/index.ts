const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const USD_AMOUNT = 25;

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  GHS: "₵",
  KES: "KSh",
  ZAR: "R",
  USD: "$",
  EUR: "€",
  GBP: "£",
  EGP: "E£",
  RWF: "RF",
  UGX: "USh",
  TZS: "TSh",
  XOF: "CFA",
  XAF: "FCFA",
  ZMW: "ZK",
  SLL: "Le",
  GNF: "FG",
  SOS: "Sh",
  MAD: "DH",
  DZD: "DA",
  TND: "DT",
  LBP: "LB£",
  MUR: "₨",
  SCR: "₨",
  BWP: "P",
  NAD: "N$",
  LSL: "L",
  SZL: "E",
  MZN: "MT",
  AOA: "Kz",
  BIF: "FBu",
  CDF: "FC",
  ETB: "Br",
  KMF: "CF",
  LRD: "L$",
  LYD: "LD",
  MRU: "UM",
  SDG: "£S",
  STN: "Db",
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  NG: "NGN", GH: "GHS", KE: "KES", ZA: "ZAR", US: "USD", EG: "EGP",
  RW: "RWF", UG: "UGX", TZ: "TZS", SN: "XOF", CI: "XOF", BF: "XOF",
  ML: "XOF", BJ: "XOF", TG: "XOF", NE: "XOF", GN: "XOF", CM: "XAF",
  CF: "XAF", GA: "XAF", TD: "XAF", CG: "XAF", GQ: "XAF", ZM: "ZMW",
  SL: "SLL", SO: "SOS", MA: "MAD", DZ: "DZD", TN: "TND", LB: "LBP",
  MU: "MUR", SC: "SCR", BW: "BWP", NA: "NAD", LS: "LSL", SZ: "SZL",
  MZ: "MZN", AO: "AOA", BI: "BIF", CD: "CDF", ET: "ETB", KM: "KMF",
  LR: "LRD", LY: "LYD", MR: "MRU", SD: "SDG", ST: "STN",
  GB: "GBP", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  BE: "EUR", AT: "EUR", IE: "EUR", PT: "EUR", FI: "EUR", GR: "EUR",
};

const USD_TO_CURRENCY: Record<string, number> = {
  GHS: 12,
  NGN: 1600,
  KES: 129,
  ZAR: 18.5,
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  EGP: 48.5,
  RWF: 1300,
  UGX: 3800,
  TZS: 2600,
  XOF: 605,
  XAF: 605,
  ZMW: 25,
  SLL: 23,
  GNF: 8600,
  SOS: 570,
  MAD: 9.9,
  DZD: 134,
  TND: 3.1,
  LBP: 89500,
  MUR: 47,
  SCR: 11.5,
  BWP: 13.5,
  NAD: 18.5,
  LSL: 18.5,
  SZL: 18.5,
  MZN: 160,
  AOA: 850,
  BIF: 2900,
  CDF: 2500,
  ETB: 128,
  KMF: 460,
  LRD: 190,
  LYD: 4.85,
  MRU: 40,
  SDG: 600,
  STN: 23,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") || "";

    let countryCode = "GH";
    let detected = false;

    if (clientIp) {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${clientIp}/country/`, {
          signal: AbortSignal.timeout(5000),
        });
        if (geoResponse.ok) {
          const country = (await geoResponse.text()).trim().toUpperCase();
          if (country && country.length === 2) {
            countryCode = country;
            detected = true;
          }
        }
      } catch {
        // Fall through to header-based detection
      }
    }

    if (!detected) {
      const cfCountry = req.headers.get("cf-ipcountry");
      if (cfCountry) {
        countryCode = cfCountry.toUpperCase();
      }
    }

    const currency = COUNTRY_TO_CURRENCY[countryCode] || "GHS";
    const rate = USD_TO_CURRENCY[currency] ?? USD_TO_CURRENCY.GHS;

    const localAmount = USD_AMOUNT * rate;
    const currencyMultiplier = 100;
    const minorUnits = Math.round(localAmount * currencyMultiplier);
    const displayAmount = Math.round(localAmount);
    const symbol = CURRENCY_SYMBOLS[currency] || currency;

    return new Response(
      JSON.stringify({
        usd_amount: USD_AMOUNT,
        currency,
        symbol,
        local_amount: displayAmount,
        minor_units: minorUnits,
        country_code: countryCode,
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
