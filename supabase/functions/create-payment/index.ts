import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handler, json, readJson, requireUser, HttpError } from "../_shared/http.ts";

Deno.serve(handler(async (req) => {
  const { user } = await requireUser(req);

  const { return_url, receipt_email } = await readJson<{ return_url?: string; receipt_email?: string }>(req);
  const appOrigin = Deno.env.get("APP_ORIGIN");
  if (!appOrigin || !return_url?.startsWith(appOrigin)) {
    throw new HttpError(400, "Invalid return_url");
  }
  if (!receipt_email || !receipt_email.includes("@") || receipt_email.length > 254) {
    throw new HttpError(400, "Invalid receipt_email");
  }

  const idempotenceKey = crypto.randomUUID();
  const credentials = btoa(`${Deno.env.get("YOOKASSA_SHOP_ID")}:${Deno.env.get("YOOKASSA_SECRET_KEY")}`);

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Idempotence-Key": idempotenceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { value: "299.00", currency: "RUB" },
      capture: true,
      save_payment_method: true,
      confirmation: { type: "redirect", return_url },
      description: "Подписка Астро+ на 30 дней",
      metadata: { plan: "astro_plus_monthly", user_id: user.id, receipt_email },
      receipt: {
        customer: { email: receipt_email },
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

  const payment = await response.json();
  if (!response.ok || !payment.confirmation?.confirmation_url) {
    console.error("YooKassa create-payment failed:", response.status);
    throw new HttpError(502, "Payment provider error");
  }

  // Наружу отдаём только то, что нужно фронту — без сырого ответа ЮKassa.
  return json(req, {
    payment_id: payment.id,
    confirmation_url: payment.confirmation.confirmation_url,
  });
}));
