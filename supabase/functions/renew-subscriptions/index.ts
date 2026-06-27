import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Ежедневный cron: пытается списать оплату по сохранённому способу.
// Успешное списание подтверждается отдельным webhook payment.succeeded,
// который и создаёт новый оплаченный период. Здесь — только попытка и учёт отказов.
const MAX_FAILED_ATTEMPTS = 3;

Deno.serve(async (req) => {
  if (req.headers.get("X-Cron-Secret") !== Deno.env.get("CRON_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: subscriptions = [] } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("provider", "yookassa")
    .eq("auto_renew", true)
    .lte("expires_at", new Date().toISOString());

  const credentials = btoa(`${Deno.env.get("YOOKASSA_SHOP_ID")}:${Deno.env.get("YOOKASSA_SECRET_KEY")}`);
  let charged = 0;
  let failed = 0;

  for (const subscription of subscriptions ?? []) {
    if (!subscription.payment_method_id || !subscription.receipt_email) continue;
    try {
      const response = await fetch("https://api.yookassa.ru/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Idempotence-Key": `renew-${subscription.user_id}-${subscription.expires_at}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: { value: "299.00", currency: "RUB" },
          capture: true,
          payment_method_id: subscription.payment_method_id,
          description: "Продление подписки Астро+ на 30 дней",
          metadata: { plan: "astro_plus_monthly", user_id: subscription.user_id, receipt_email: subscription.receipt_email },
          receipt: {
            customer: { email: subscription.receipt_email },
            items: [{
              description: "Подписка Астро+ на 30 дней",
              quantity: "1.00",
              amount: { value: "299.00", currency: "RUB" },
              vat_code: 1,
              payment_mode: "full_payment",
              payment_subject: "service",
            }],
          },
        }),
      });

      const payment = await response.json().catch(() => ({}));
      // canceled = карта отклонена/недостаточно средств. succeeded/pending — webhook довершит.
      if (!response.ok || payment.status === "canceled") {
        failed++;
        const attempts = (subscription.failed_attempts ?? 0) + 1;
        await supabase.from("subscriptions").update({
          failed_attempts: attempts,
          last_renew_error: payment.cancellation_details?.reason ?? `http_${response.status}`,
          // После N неудач выключаем автопродление, чтобы не дёргать карту каждый день.
          auto_renew: attempts < MAX_FAILED_ATTEMPTS,
          status: attempts < MAX_FAILED_ATTEMPTS ? "past_due" : "canceled",
          updated_at: new Date().toISOString(),
        }).eq("user_id", subscription.user_id);
      } else {
        charged++;
        await supabase.from("subscriptions").update({
          failed_attempts: 0,
          last_renew_error: null,
          updated_at: new Date().toISOString(),
        }).eq("user_id", subscription.user_id);
      }
    } catch (err) {
      failed++;
      console.error("renew failed for", subscription.user_id, err);
    }
  }

  return Response.json({ attempted: subscriptions?.length ?? 0, charged, failed });
});
