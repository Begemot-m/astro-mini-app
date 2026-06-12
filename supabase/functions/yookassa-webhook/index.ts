import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const event = await req.json();
  if (event.event !== "payment.succeeded") return new Response("ok");

  const webhookPayment = event.object;
  const credentials = btoa(`${Deno.env.get("YOOKASSA_SHOP_ID")}:${Deno.env.get("YOOKASSA_SECRET_KEY")}`);
  const verification = await fetch(`https://api.yookassa.ru/v3/payments/${webhookPayment.id}`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!verification.ok) return new Response("verification failed", { status: 400 });
  const payment = await verification.json();
  const userId = payment.metadata?.user_id;
  if (payment.status !== "succeeded" || !payment.paid || !userId || payment.amount?.value !== "299.00" || payment.amount?.currency !== "RUB") {
    return new Response("invalid", { status: 400 });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("subscriptions").upsert({ user_id: userId, provider: "yookassa", status: "active", plan: "astro_plus_monthly", external_id: payment.id, payment_method_id: payment.payment_method?.id, receipt_email: payment.metadata?.receipt_email, auto_renew: true, expires_at: expiresAt });
  return new Response("ok");
});
