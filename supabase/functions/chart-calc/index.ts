import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handler, json, readJson, requireUser, HttpError } from "../_shared/http.ts";

Deno.serve(handler(async (req) => {
  // Расчёт карты — персональные данные рождения, поэтому только для авторизованных.
  await requireUser(req);

  const engineUrl = Deno.env.get("CHART_CALC_URL");
  if (!engineUrl) {
    return json(req, {
      error: "CHART_CALC_URL is not configured",
      message: "Do not display exact chart data until Swiss Ephemeris calculation service is connected.",
    }, 503);
  }

  const birthData = await readJson(req);
  const response = await fetch(engineUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("CHART_CALC_TOKEN") || ""}`,
    },
    body: JSON.stringify(birthData),
  });

  if (!response.ok) {
    console.error("chart-calc engine failed:", response.status);
    throw new HttpError(502, "Chart engine error");
  }
  return json(req, await response.json());
}));
