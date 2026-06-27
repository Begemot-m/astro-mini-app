import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Официальные сети уведомлений ЮKassa (defense-in-depth, включается YOOKASSA_VERIFY_IP=true).
const YOOKASSA_NETS = [
  "185.71.76.0/27",
  "185.71.77.0/27",
  "77.75.153.0/25",
  "77.75.156.11/32",
  "77.75.156.35/32",
  "77.75.154.128/25",
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const o = Number(p);
    if (!Number.isInteger(o) || o < 0 || o > 255) return null;
    n = (n << 8) | o;
  }
  return n >>> 0;
}

function ipAllowed(ip: string): boolean {
  const addr = ipv4ToInt(ip);
  if (addr === null) return false; // IPv6 и прочее не пропускаем при строгой проверке
  return YOOKASSA_NETS.some((cidr) => {
    const [base, bitsStr] = cidr.split("/");
    const baseInt = ipv4ToInt(base);
    if (baseInt === null) return false;
    const bits = Number(bitsStr);
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (addr & mask) === (baseInt & mask);
  });
}

const MAX_BODY_BYTES = 64 * 1024;

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  // 1. Секрет в URL/заголовке — webhook настраивается в ЮKassa как .../yookassa-webhook?secret=XXX
  const expectedSecret = Deno.env.get("YOOKASSA_WEBHOOK_SECRET");
  if (expectedSecret) {
    const url = new URL(req.url);
    const provided = req.headers.get("X-Webhook-Secret") ?? url.searchParams.get("secret") ?? "";
    if (provided !== expectedSecret) return new Response("forbidden", { status: 403 });
  }

  // 2. Опциональная проверка IP-источника.
  if (Deno.env.get("YOOKASSA_VERIFY_IP") === "true") {
    const fwd = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    if (!fwd || !ipAllowed(fwd)) return new Response("forbidden", { status: 403 });
  }

  // 3. Лимит размера тела.
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return new Response("payload too large", { status: 413 });
  let event: { event?: string; object?: { id?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("invalid json", { status: 400 });
  }
  if (!event.event || !event.object?.id) return new Response("invalid event", { status: 400 });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const eventId = `${event.event}:${event.object.id}`;

  // 4. Идемпотентность: повторное событие отбрасывается по уникальному ID.
  const { error: eventError } = await admin
    .from("payment_events")
    .insert({ id: eventId, event_type: event.event, payload: event });
  if (eventError && eventError.code === "23505") return new Response("ok");
  if (eventError) return new Response("event store failed", { status: 500 });
  if (event.event !== "payment.succeeded") return new Response("ok");

  // 5. Источник истины — повторный запрос к API ЮKassa, а не тело webhook.
  const credentials = btoa(`${Deno.env.get("YOOKASSA_SHOP_ID")}:${Deno.env.get("YOOKASSA_SECRET_KEY")}`);
  const verification = await fetch(`https://api.yookassa.ru/v3/payments/${event.object.id}`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!verification.ok) {
    await admin.from("payment_events").update({ processing_error: `verify_${verification.status}` }).eq("id", eventId);
    return new Response("verification failed", { status: 400 });
  }

  const payment = await verification.json();
  const userId = payment.metadata?.user_id;
  if (
    payment.status !== "succeeded" || !payment.paid || !userId ||
    payment.amount?.value !== "299.00" || payment.amount?.currency !== "RUB"
  ) {
    await admin.from("payment_events").update({ processing_error: "validation_failed" }).eq("id", eventId);
    return new Response("invalid", { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  // Неизменяемый оплаченный период (external_payment_id unique → защита от двойного зачисления).
  const { error: periodError } = await admin.from("subscription_periods").insert({
    user_id: userId,
    provider: "yookassa",
    external_payment_id: payment.id,
    plan: "astro_plus_monthly",
    starts_at: new Date().toISOString(),
    ends_at: expiresAt,
    amount: 299,
    currency: "RUB",
  });
  // 23505 = период по этому платежу уже создан; считаем обработанным.
  if (periodError && periodError.code !== "23505") {
    await admin.from("payment_events").update({ processing_error: "period_insert_failed" }).eq("id", eventId);
    return new Response("period store failed", { status: 500 });
  }

  await admin.from("subscriptions").upsert({
    user_id: userId,
    provider: "yookassa",
    status: "active",
    plan: "astro_plus_monthly",
    external_id: payment.id,
    payment_method_id: payment.payment_method?.id,
    receipt_email: payment.metadata?.receipt_email,
    auto_renew: true,
    expires_at: expiresAt,
  });
  await admin.from("payment_events").update({ processed_at: new Date().toISOString() }).eq("id", eventId);
  return new Response("ok");
});
