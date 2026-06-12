import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const auth = req.headers.get("Authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401, headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: cors });

  const { return_url, receipt_email } = await req.json();
  const appOrigin = Deno.env.get("APP_ORIGIN");
  if (!appOrigin || !return_url?.startsWith(appOrigin)) return Response.json({ error: "Invalid return_url" }, { status: 400, headers: cors });
  const idempotenceKey = crypto.randomUUID();
  const credentials = btoa(`${Deno.env.get("YOOKASSA_SHOP_ID")}:${Deno.env.get("YOOKASSA_SECRET_KEY")}`);

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: { "Authorization": `Basic ${credentials}`, "Idempotence-Key": idempotenceKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: { value: "299.00", currency: "RUB" },
      capture: true,
      save_payment_method: true,
      confirmation: { type: "redirect", return_url },
      description: "Подписка Астро+ на 30 дней",
      metadata: { plan: "astro_plus_monthly", user_id: user.id, receipt_email },
      receipt: receipt_email ? { customer: { email: receipt_email }, items: [{ description: "Подписка Астро+ на 30 дней", quantity: "1.00", amount: { value: "299.00", currency: "RUB" }, vat_code: 1, payment_mode: "full_payment", payment_subject: "service" }] } : undefined,
    }),
  });
  const payment = await response.json();
  return Response.json({ payment_id: payment.id, confirmation_url: payment.confirmation?.confirmation_url }, { status: response.status, headers: cors });
});
