import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const engineUrl = Deno.env.get("CHART_CALC_URL");
  if (!engineUrl) {
    return Response.json({
      error: "CHART_CALC_URL is not configured",
      message: "Do not display exact chart data until Swiss Ephemeris calculation service is connected."
    }, { status: 503, headers: cors });
  }
  const birthData = await req.json();
  const response = await fetch(engineUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("CHART_CALC_TOKEN") || ""}` },
    body: JSON.stringify(birthData),
  });
  return new Response(await response.text(), { status: response.status, headers: { ...cors, "Content-Type": "application/json" } });
});
